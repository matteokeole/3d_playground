import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {max, PI, rad, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";
import {PLAYER_COLLISION_HULL, PLAYER_EYE_LEVEL} from "../../../index.js";

export class DevInstance extends Instance {
	static #SENSITIVITY = 0.075;

	#gravity = new Vector3(0, -800, 0);
	#speed = 450; // Acceleration rate - same for forward/back/side
	#groundAccelerateConstant = 10;
	#airAccelerateConstant = 10;
	#normSpeed = 190; // Normal speed
	#walkSpeed = 400; // HL1
	#sprintSpeed = 320;
	#jumpSpeed = 320; // Up speed
	#maxSpeed = 270;
	#stopSpeed = 100;
	#pitchSpeed = 225;
	#yawSpeed = 210;
	#friction = 4; // Not from HL2: https://developer.valvesoftware.com/wiki/Sv_friction
	#frictionApplyThreshold = 0.1;

	#travellingMedium = "air";
	#forwardmove = 0;
	#sidemove = 0;
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

		this.#handleInputs();

		// Begin

		this.#addCorrectGravity(deltaTime);

		if (this.getActiveKeyCodes()["Space"] === true) {
			if (this.#travellingMedium === "ground") {
				this.#handleJump();
			}
		}

		if (this.#travellingMedium === "ground") {
			// Reset Y before applying friction
			this.#velocity[1] = 0;

			this.#applyFriction(deltaTime);
		}

		if (this.#travellingMedium === "ground") {
			this.#walkMove(deltaTime);

			// Apply velocity
			playerMesh.getPosition()[0] += this.#velocity[0] * deltaTime;
			// playerMesh.getPosition[1] = 0;
			playerMesh.getPosition()[2] += this.#velocity[2] * deltaTime;
			playerMesh.updateWorld();
		} else {
			this.#airMove(deltaTime);
		}

		this.#fixupGravityVelocity(deltaTime);

		if (this.#travellingMedium === "air") {
			// Apply velocity
			this.#applyVelocity(playerMesh, deltaTime);
		}

		// If we are on ground, no downward velocity.
		if (this.#travellingMedium === "ground") {
			this.#velocity[1] = 0;
		}

		// End

		if (playerMesh.getProxyGeometry()) {
			this.#testCollide(camera, otherPhysicMeshes, playerMesh);
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

		// Start refactor

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

		// End refactor
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

		forward[1] = 0;
		right[1] = 0;

		forward.normalize();
		right.normalize();

		const wishvel = new Vector3(0, 0, 0);
		wishvel[0] = forward[0] * this.#forwardmove + right[0] * this.#sidemove;
		wishvel[1] = 0;
		wishvel[2] = forward[2] * this.#forwardmove + right[2] * this.#sidemove;

		const wishdir = new Vector3(wishvel);
		let wishspeed = wishdir.magnitude(); // = length of wishvel
		wishdir.normalize();

		// Clamp to max speed
		if (wishspeed > this.#maxSpeed) {
			wishvel.multiplyScalar(this.#maxSpeed / wishspeed);

			wishspeed = this.#maxSpeed;
		}

		this.#velocity[1] = 0;
		this.#accelerate(wishdir, wishspeed, this.#groundAccelerateConstant, deltaTime);
		this.#velocity[1] = 0;

		let spd = this.#velocity.magnitude();

		if (spd < 1.0) {
			this.#velocity.set(new Vector3(0, 0, 0));

			return;
		}

		/* wishAccelerationDirection.normalize();
		wishAccelerationDirection.multiplyScalar(this.#airAccelerateConstant);

		this.#velocity.add(wishAccelerationDirection);

		const speed = this.#velocity.magnitude();

		// Clamp to server defined max speed
		if (speed > this.#maxSpeed) {
			const newSpeed = speed - this.#maxSpeed;

			this.#velocity.multiplyScalar((speed - newSpeed) / speed);
		} */
	}

	#handleInputs() {
		// Reset movements
		this.#forwardmove = 0;
		this.#sidemove = 0;

		const forwardKeyState = this.getActiveKeyCodes()["KeyW"] ? 1 : 0;
		const backKeyState = this.getActiveKeyCodes()["KeyS"] ? 1 : 0;

		this.#forwardmove += this.#walkSpeed * forwardKeyState;
		this.#forwardmove -= this.#walkSpeed * backKeyState;

		const rightKeyState = this.getActiveKeyCodes()["KeyD"] ? 1 : 0;
		const leftKeyState = this.getActiveKeyCodes()["KeyA"] ? 1 : 0;

		this.#sidemove += this.#walkSpeed * rightKeyState;
		this.#sidemove -= this.#walkSpeed * leftKeyState;
	}

	/**
	 * @param {Vector3} wishdir The normalized direction that the player has requested to move (taking into account the movement keys and look direction)
	 * @param {Number} wishspeed
	 * @param {Number} accel The server-defined player acceleration value
	 * @param {Number} deltaTime
	 */
	#accelerate(wishdir, wishspeed, accel, deltaTime) {
		// See if we are changing direction a bit
		const currentspeed = this.#velocity.dot(wishdir);

		// Reduce wishspeed by the amount of veer.
		const addspeed = wishspeed - currentspeed;

		// If not going to add any speed, done.
		if (addspeed <= 0) {
			return;
		}

		// Determine amount of acceleration.
		let accelspeed = wishspeed * accel * deltaTime; // friction = 1?

		// Cap at addspeed
		if (accelspeed > addspeed) {
			accelspeed = addspeed;
		}

		this.#velocity[0] += accelspeed * wishdir[0];
		this.#velocity[1] += accelspeed * wishdir[1];
		this.#velocity[2] += accelspeed * wishdir[2];
	}

	/**
	 * @param {Number} deltaTime
	 */
	#applyGravity(deltaTime) {
		const gravity = new Vector3(this.#gravity);

		this.#velocity[1] -= -gravity[1] * 0.5 * deltaTime;

		// V(n+1) = V(n) + G * Δt
		// this.#velocity.add(gravity.multiplyScalar(deltaTime));
	}

	/**
	 * @param {Number} deltaTime
	 */
	#addCorrectGravity(deltaTime) {
		this.#velocity[1] += this.#gravity[1] * deltaTime * 0.5;
	}

	/**
	 * @param {Number} deltaTime
	 */
	#fixupGravityVelocity(deltaTime) {
		this.#velocity[1] += this.#gravity[1] * deltaTime * 0.5;
	}

	/**
	 * @param {Number} deltaTime
	 */
	#applyFriction(deltaTime) {
		const speed = this.#velocity.magnitude();

		// If too slow, return
		// This avoids a division by 0
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
	 */
	#testCollide(camera, physicMeshes, playerMesh) {
		/**
		 * @todo
		 */
		// this.#travellingMedium = "air";

		for (let i = 0; i < physicMeshes.length; i++) {
			const physicMesh = physicMeshes[i];
			const hitResponse = this.#hitTest(playerMesh, physicMesh);

			if (!hitResponse) {
				continue;
			}

			const force = new Vector3(hitResponse.normal).multiplyScalar(hitResponse.depth);

			/**
			 * @todo Fix blocking edges between geometries
			 */
			playerMesh.getPosition().subtract(force);
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

	#handleJump() {
		// Reset jump
		// this.getActiveKeyCodes()["Space"] = false;

		this.#velocity[1] = Math.sqrt(2 * 800 * 45.0);
		this.#travellingMedium = "air";
	}
}