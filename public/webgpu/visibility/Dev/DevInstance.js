import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PI, rad, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";

export class DevInstance extends Instance {
	static #GRAVITY = new Vector3(0, -0.4, 0);
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 100;
	static #SENSITIVITY = 0.075;

	#cameraVelocity;
	#lastRoll;

	/**
	 * @param {import("../../../../src/Instance.js").InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#cameraVelocity = new Vector3(0, 0, 0);
		this.#lastRoll = 0;

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

		this.#move(camera, deltaTime);

		camera.update();

		this.getDebugger().update({
			"Position": camera.getPosition(),
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
		});

		return;

		// this.#cameraVelocity.set(new Vector3(this.getHorizontalRawAxis(), 0, this.getVerticalRawAxis()));
		// this.#cameraVelocity.normalize();
		// this.#cameraVelocity.multiplyScalar(DevInstance.#CAMERA_SPEED);
		// this.#cameraVelocity.add(DevInstance.#GRAVITY);

		// Move mesh to a potentially invalid location
		// playerMesh.getPosition().add(this.#cameraVelocity);
		camera.getPosition().add(this.#cameraVelocity);
		camera.update();
		// playerMesh.updateWorld();

		// Detect and resolve collision
		/* if (playerMesh.getProxyGeometry()) {
			this.#testCollide(otherPhysicMeshes, playerMesh, this.#cameraVelocity);
		} */

		// renderer.writeMeshWorld(playerMeshIndex, playerMesh.getWorld());

		camera.update();

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(1),
			"Position": playerMesh.getPosition(),
			"Velocity": this.#cameraVelocity,
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {PerspectiveCamera} camera
	 * @param {Number} deltaTime
	 */
	#move(camera, deltaTime) {
		const horizontal = this.getHorizontalRawAxis();
		const vertical = this.getVerticalRawAxis();
		const movement = new Vector3(horizontal, 0, vertical).normalize();

		camera.move(movement);

		const leftRoll = Number(this.getActiveKeyCodes()["KeyQ"] ?? 0) * -1 * DevInstance.#SENSITIVITY * 4;
		const rightRoll = Number(this.getActiveKeyCodes()["KeyE"] ?? 0) * 1 * DevInstance.#SENSITIVITY * 4;
		const eulerAngles = new Vector3(0, 0, rad(leftRoll + rightRoll));

		camera.rotate(eulerAngles);
	}

	/**
	 * @param {Number} deltaTime
	 * @param {Vector3} velocity
	 */
	#accelerate(deltaTime, velocity) {
		velocity.set(new Vector3(0, 0, 0));

		/* if (this.#activeKeyCodes["KeyW"]) {
			velocity[2] = 1;
		}
		if (this.#activeKeyCodes["KeyS"]) {
			velocity[2] = -1;
		}
		if (this.#activeKeyCodes["KeyA"]) {
			velocity[0] = -1;
		}
		if (this.#activeKeyCodes["KeyD"]) {
			velocity[0] = 1;
		} */

		velocity.normalize();
		velocity.multiplyScalar(DevInstance.#CAMERA_SPEED);
		velocity.multiplyScalar(DevInstance.#FRICTION);

		/* const speed = velocity.magnitude();

		if (speed === 0) {
			return;
		} */

		// const drop = speed * DevInstance.#FRICTION;

		// velocity.multiplyScalar(speed - drop);
		// velocity.multiplyScalar(DevInstance.#FRICTION);

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
	 * @param {Vector3} velocity
	 */
	#testCollide(physicMeshes, playerMesh, velocity) {
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
			playerMesh.updateWorld();
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