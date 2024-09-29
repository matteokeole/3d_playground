import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PI, rad, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";

export class DevInstance extends Instance {
	static #SENSITIVITY = 0.075;

	#gravity = -0.02;
	#airVelocity = 320;

	#travellingMedium = "air";
	#cameraVelocity = new Vector3(0, 0, 0);
	#cameraSpeed = 1;
	#friction = 0.05;

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
			this.#airAccelerate(camera);
		} else {
			this.#groundAccelerate(camera, deltaTime);
		}

		this.#cameraVelocity[1] += this.#gravity;

		camera.move(this.#cameraVelocity);

		// Camera position must be set before extracting it for the player mesh
		camera.update();

		// Move mesh to a potentially invalid location
		playerMesh.getPosition().set(camera.getPosition());
		playerMesh.updateWorld();

		// Detect and resolve collision
		if (playerMesh.getProxyGeometry()) {
			this.#testCollide(otherPhysicMeshes, playerMesh);
		}

		camera.getPosition().set(playerMesh.getPosition());
		camera.update();

		// The mesh world is already updated, upload it into the mesh buffer
		renderer.writeMeshWorld(playerMeshIndex, playerMesh.getWorld());

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(1),
			"Position": camera.getPosition(),
			"Velocity": this.#cameraVelocity,
			"Velocity length": this.#cameraVelocity.magnitude().toPrecision(2),
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
			"Medium": this.#travellingMedium,
			"Controls": "---------------",
			// AZERTY layout
			"KeyZ": this.getActiveKeyCodes()["KeyW"] ?? false,
			"KeyQ": this.getActiveKeyCodes()["KeyA"] ?? false,
			"KeyS": this.getActiveKeyCodes()["KeyS"] ?? false,
			"KeyD": this.getActiveKeyCodes()["KeyD"] ?? false,
			"Space": this.getActiveKeyCodes()["Space"] ?? false,
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * No friction
	 * 
	 * @param {PerspectiveCamera} camera
	 */
	#airAccelerate(camera) {
		const velocity = this.#cameraVelocity;

		if (this.getHorizontalRawAxis()) {
			velocity[0] = this.getHorizontalRawAxis() * this.#cameraSpeed;
		}

		if (this.getVerticalRawAxis()) {
			velocity[2] = this.getVerticalRawAxis() * this.#cameraSpeed;
		}
	}

	/**
	 * @param {PerspectiveCamera} camera
	 * @param {Number} deltaTime
	 */
	#groundAccelerate(camera, deltaTime) {
		const velocity = this.#cameraVelocity;

		velocity.multiplyScalar(1 - this.#friction);

		if (this.getHorizontalRawAxis()) {
			velocity[0] = this.getHorizontalRawAxis() * this.#cameraSpeed;
		}

		if (this.getActiveKeyCodes()["Space"] === true) {
			/**
			 * @todo Disable space?
			 */
			// this.getActiveKeyCodes()["Space"] = false;

			velocity[1] = 1;
		}

		if (this.getVerticalRawAxis()) {
			velocity[2] = this.getVerticalRawAxis() * this.#cameraSpeed;
		}

		// velocity.normalize();

		///
		/// Friction
		///

		/* const speed = velocity.magnitude();

		if (speed === 0) {
			return;
		}

		const drop = speed * DevInstance.#FRICTION * deltaTime;

		velocity.multiplyScalar(max(speed - drop, 0)); */
	}

	/**
	 * @param {Mesh[]} physicMeshes
	 * @param {Mesh} playerMesh
	 */
	#testCollide(physicMeshes, playerMesh) {
		this.#travellingMedium = "air";

		for (let i = 0; i < physicMeshes.length; i++) {
			const physicMesh = physicMeshes[i];
			const hitResponse = this.#hitTest(playerMesh, physicMesh);

			if (!hitResponse) {
				continue;
			}

			const force = hitResponse.normal.multiplyScalar(hitResponse.depth);

			/**
			 * @todo Fix blocking edges between geometries
			 */
			playerMesh.getPosition().subtract(force);
			// this.#cameraVelocity.subtract(force);
			playerMesh.updateWorld();

			// Colliding with something is equivalent to travelling through a ground medium
			// This method is unbalanced (can spam jump if next to a wall) and will be reworked
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
}