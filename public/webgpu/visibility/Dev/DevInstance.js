import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {max, PI, rad, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";
import {PLAYER_COLLISION_HULL, PLAYER_EYE_LEVEL} from "../../../index.js";

export class DevInstance extends Instance {
	static #SENSITIVITY = 0.075;

	#gravity = new Vector3(0, -600, 0);
	#speed = 450; // Acceleration rate - same for forward/back/side
	#groundAccelerateConstant = 10;
	#airAccelerateConstant = 10;
	#normSpeed = 190; // Normal speed
	#walkSpeed = 150;
	#sprintSpeed = 320;
	#jumpSpeed = 320; // Up speed
	#maxSpeed = 270;
	#stopSpeed = 100;
	#pitchSpeed = 225;
	#yawSpeed = 210;
	#friction = 4; // Not from HL2: https://developer.valvesoftware.com/wiki/Sv_friction
	#frictionApplyThreshold = 0.1;

	#travellingMedium = "ground";
	#velocity = new Vector3(0, 0, 0);
	#frameIndex = 0;

	/**
	 * @param {import("../../../../src/Instance.js").InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this._renderer.getCanvas().addEventListener("mousemove", this.#onMouseMove.bind(this));
	}

	/**
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {
		// Frame analysis
		{
			// deltaTime = 0.00606;

			/* if (this.#frameIndex === 3) {
				console.warn("Time's up!");

				debugger;
			}

			console.log("Frame", this.#frameIndex); */
		}

		/**
		 * @type {VisibilityRenderer}
		 */
		const renderer = this._renderer;
		const scene = renderer.getScene();
		const meshes = scene.getMeshes();
		const playerMesh = meshes.find(mesh => mesh.getDebugName() === "player");
		const playerMeshIndex = meshes.findIndex(mesh => mesh.getDebugName() === "player");
		const otherPhysicMeshes = scene.getPhysicMeshes().filter(mesh => mesh.getDebugName() !== "player");

		if (!playerMesh) {
			return;
		}

		const camera = this._renderer.getCamera();

		if (!(camera instanceof PerspectiveCamera)) {
			throw new Error("Only PerspectiveCamera instances supported.");
		}

		if (this.#travellingMedium === "air") {
			this.#airMove(deltaTime);
		} else {
			this.#applyFriction(deltaTime);
			this.#walkMove(deltaTime);
		}

		// this.#applyGravity(deltaTime);

		if (playerMesh.getProxyGeometry()) {
			this.#testCollide(camera, otherPhysicMeshes, playerMesh, deltaTime);
		} else {
			this.#applyVelocity(playerMesh, deltaTime);
		}

		this.#cameraLookAtPlayer(camera, playerMesh);

		// Camera position must be set before extracting it for the player mesh
		camera.update();

		// The mesh world is already updated, upload it into the mesh buffer
		renderer.writeMeshWorld(playerMeshIndex, playerMesh.getWorld());

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(3),
			"Camera": "---------------",
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
			"Player": "---------------",
			"Medium": this.#travellingMedium,
			"Position": playerMesh.getPosition(),
			"Velocity": this.#velocity,
			"Velocity length": this.#velocity.magnitude().toFixed(2),
			"Controls": "---------------",
			// AZERTY layout
			"KeyZ": this.getActiveKeyCodes()["KeyW"] ?? false,
			"KeyQ": this.getActiveKeyCodes()["KeyA"] ?? false,
			"KeyS": this.getActiveKeyCodes()["KeyS"] ?? false,
			"KeyD": this.getActiveKeyCodes()["KeyD"] ?? false,
			"Space": this.getActiveKeyCodes()["Space"] ?? false,
		});

		this.#frameIndex++;
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Mesh} playerMesh
	 * @param {PerspectiveCamera} camera
	 * @param {Number} deltaTime
	 */
	#applyVelocity(playerMesh, deltaTime) {
		// P(n+1) = P(n) + V * Δt
		playerMesh.getPosition().add(new Vector3(this.#velocity).multiplyScalar(deltaTime));
		playerMesh.updateWorld();
	}

	/**
	 * @param {Number} deltaTime
	 */
	#airMove(deltaTime) {
		/** @type {PerspectiveCamera} */
		const camera = this._renderer.getCamera();

		const forward = camera.getForward();
		const right = camera.getRight();

		const forwardMove = this.getVerticalRawAxis();
		const sideMove = this.getHorizontalRawAxis();

		forward[1] = 0;
		right[1] = 0;

		forward.normalize();
		right.normalize();

		const wishVelocity = new Vector3(0, 0, 0);
		wishVelocity[0] = forward[0] * forwardMove + right[0] * sideMove;
		wishVelocity[1] = 0;
		wishVelocity[2] = forward[2] * forwardMove + right[2] * sideMove;

		const wishSpeed = wishVelocity.magnitude();
		const wishDirection = new Vector3(wishVelocity).normalize();

		wishDirection.multiplyScalar(this.#airAccelerateConstant);

		this.#velocity.add(wishDirection);

		const speed = this.#velocity.magnitude();

		// Cap speed
		if (speed > this.#maxSpeed) {
			const newSpeed = speed - this.#maxSpeed;

			this.#velocity.multiplyScalar((speed - newSpeed) / speed);
		}
	}

	/**
	 * @param {Vector3} wishDirection
	 * @param {Number} wishSpeed
	 * @param {Number} acceleration
	 * @param {Number} deltaTime
	 */
	#airAccelerate(wishDirection, wishSpeed, acceleration, deltaTime) {
		let wishSpd = wishSpeed;

		if (wishSpd > 30) {
			wishSpd = 30;
		}

		// Determine veer amount
		const currentSpeed = this.#velocity.dot(wishDirection);

		// See how much to add
		const addSpeed = wishSpd - currentSpeed;

		// If not adding any, done.
		if (addSpeed <= 0) {
			return;
		}

		// Determine acceleration speed after acceleration
		let accelspeed = acceleration * wishSpeed * this.#friction * deltaTime;

		// Cap it
		if (accelspeed > addSpeed) {
			accelspeed = addSpeed;
		}

		this.#velocity.add(new Vector3(wishDirection).multiplyScalar(accelspeed));
	}

	/**
	 * @param {Number} deltaTime
	 */
	#walkMove(deltaTime) {
		/** @type {PerspectiveCamera} */
		const camera = this._renderer.getCamera();

		const forward = camera.getForward();
		const right = camera.getRight();

		const forwardMove = this.getVerticalRawAxis();
		const sideMove = this.getHorizontalRawAxis();

		forward[1] = 0;
		right[1] = 0;

		forward.normalize();
		right.normalize();

		const wishAccelerationDirection = new Vector3(0, 0, 0);
		wishAccelerationDirection[0] = forward[0] * forwardMove + right[0] * sideMove;
		wishAccelerationDirection[1] = 0;
		wishAccelerationDirection[2] = forward[2] * forwardMove + right[2] * sideMove;

		wishAccelerationDirection.normalize();
		wishAccelerationDirection.multiplyScalar(this.#airAccelerateConstant);

		this.#velocity.add(wishAccelerationDirection);

		const speed = this.#velocity.magnitude();

		// Cap speed
		if (speed > this.#maxSpeed) {
			const newSpeed = speed - this.#maxSpeed;

			this.#velocity.multiplyScalar((speed - newSpeed) / speed);
		}
	}

	/**
	 * @param {Vector3} direction The normalized direction that the player has requested to move (taking into account the movement keys and look direction)
	 * @param {Number} accelerationConstant The server-defined player acceleration value
	 * @param {Number} maxVelocityConstant The server-defined maximum player velocity (this is not strictly adhered to due to strafejumping)
	 * @param {Number} deltaTime
	 */
	#accelerate(direction, accelerationConstant, maxVelocityConstant, deltaTime) {
		const projectedVelocity = this.#velocity.dot(direction); // Projection of velocity onto direction
		let accelerationSpeed = accelerationConstant * deltaTime;

		// Velocity projection must not exceed maxVelocityConstant
		if (projectedVelocity + accelerationSpeed > maxVelocityConstant) {
			accelerationSpeed = maxVelocityConstant - projectedVelocity;
		}

		// V(n=1) = V(n) + d * a
		this.#velocity.add(new Vector3(direction).multiplyScalar(accelerationSpeed));
	}

	/**
	 * @param {Number} deltaTime
	 */
	#applyGravity(deltaTime) {
		const gravity = new Vector3(this.#gravity);

		// V(n+1) = V(n) + G * Δt
		this.#velocity.add(gravity.multiplyScalar(deltaTime));
	}

	/**
	 * @param {Number} deltaTime
	 */
	#applyFriction(deltaTime) {
		const speed = this.#velocity.magnitude();

		// If too slow, return
		// This avoids the division by 0
		if (speed < this.#frictionApplyThreshold) {
			return;
		}

		// Take the largest value between the current speed and StopSpeed.
		// This makes that once at a slow speed (< 100) the friction will not get below 100 * f * Δt,
		// thus slowing us down faster.
		//
		//   "Bleed off some speed, but if we have less than the
		//    bleed threshold, bleed the threshold amount." - GoldSrc
		//
		const control = max(speed, this.#stopSpeed);

		const friction = this.#friction;

		const drop = control * friction * deltaTime;

		// Scale the velocity
		let newSpeed = max(speed - drop, 0);

		// Determine proportion of old speed we are using.
		newSpeed /= speed;

		// Scale velocity according to proportion
		this.#velocity.multiplyScalar(newSpeed);
	}

	/**
	 * @param {PerspectiveCamera} camera
	 * @param {Mesh[]} physicMeshes
	 * @param {Mesh} playerMesh
	 * @param {Number} deltaTime
	 */
	#testCollide(camera, physicMeshes, playerMesh, deltaTime) {
		this.#travellingMedium = "air";

		const previousPosition = playerMesh.getPosition();

		for (let i = 0; i < physicMeshes.length; i++) {
			// Set a tentative position
			this.#applyVelocity(playerMesh, camera, deltaTime);

			const physicMesh = physicMeshes[i];
			const hitResponse = this.#hitTest(playerMesh, physicMesh);

			if (!hitResponse) {
				continue;
			}

			const force = new Vector3(hitResponse.normal).multiplyScalar(hitResponse.depth);

			/**
			 * @todo Fix blocking edges between geometries
			 */
			this.#velocity.subtract(force);

			// Reset player mesh position to the one before collision
			playerMesh.setPosition(previousPosition);
			playerMesh.updateWorld();

			// Colliding with an object changes the travelling medium to "ground"
			// Bug: player can jump on the side of the mesh to reach it
			this.#travellingMedium = "ground";
		}
	}

	/**
	 * @param {Mesh} dynamicMesh
	 * @param {Mesh} staticMesh
	 */
	#hitTest(dynamicMesh, staticMesh) {
		const simplex = GJK.test3d(dynamicMesh, staticMesh);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		const collision = EPA.test3d(dynamicMesh, staticMesh, simplex);

		return collision;
	}

	/**
	 * @param {MouseEvent} event
	 */
	#onMouseMove(event) {
		if (!this._renderer.isPointerLocked()) {
			return;
		}

		const camera = this._renderer.getCamera();

		if (!(camera instanceof PerspectiveCamera)) {
			throw new Error("Only PerspectiveCamera instances supported.");
		}

		const pitch = this.getMouseYAxis(event) * DevInstance.#SENSITIVITY;
		const yaw = this.getMouseXAxis(event) * DevInstance.#SENSITIVITY;

		camera.rotate(new Vector3(rad(pitch), rad(yaw), 0));
	}

	/**
	 * @param {PerspectiveCamera} camera
	 * @param {Mesh} playerMesh
	 */
	#cameraLookAtPlayer(camera, playerMesh) {
		camera.setPosition(playerMesh.getPosition());
		camera.getPosition()[1] += -PLAYER_COLLISION_HULL[1] / 2 + PLAYER_EYE_LEVEL; // Reset to foot level, then add to get to eye level
	}
}