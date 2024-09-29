import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PI, rad, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";

export class DevInstance extends Instance {
	static #GRAVITY = new Vector3(0, -0.4, 0);
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 1;
	static #SENSITIVITY = 0.075;

	#cameraVelocity;

	/**
	 * @param {import("../../../../src/Instance.js").InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#cameraVelocity = new Vector3(0, 0, 0);

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

		this.#accelerate(camera, this.#cameraVelocity, deltaTime);

		// Camera position must be set before extracting it for the player mesh
		camera.update();

		// Move mesh to a potentially invalid location
		playerMesh.getPosition().set(camera.getPosition());
		playerMesh.getPosition().add(DevInstance.#GRAVITY);
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
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {PerspectiveCamera} camera
	 * @param {Vector3} velocity
	 * @param {Number} deltaTime
	 */
	#accelerate(camera, velocity, deltaTime) {
		velocity[0] = this.getHorizontalRawAxis();
		velocity[1] = 0;
		velocity[2] = this.getVerticalRawAxis();
		velocity.normalize();
		velocity.multiplyScalar(DevInstance.#CAMERA_SPEED);
		velocity.multiplyScalar(DevInstance.#FRICTION);
		// velocity.add(DevInstance.#GRAVITY);

		/* const speed = velocity.magnitude();

		if (speed === 0) {
			return;
		}

		const drop = speed * DevInstance.#FRICTION * deltaTime;

		velocity.multiplyScalar(max(speed - drop, 0)); */

		camera.move(velocity);

		const leftRoll = Number(this.getActiveKeyCodes()["KeyQ"] ?? 0) * -1 * DevInstance.#SENSITIVITY * 4;
		const rightRoll = Number(this.getActiveKeyCodes()["KeyE"] ?? 0) * 1 * DevInstance.#SENSITIVITY * 4;
		const eulerAngles = new Vector3(0, 0, rad(leftRoll + rightRoll));

		camera.rotate(eulerAngles);
	}

	/**
	 * @param {Mesh[]} physicMeshes
	 * @param {Mesh} playerMesh
	 */
	#testCollide(physicMeshes, playerMesh) {
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