import {Instance} from "../../../../src/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";

export class DevInstance extends Instance {
	static #GRAVITY = new Vector3(0, -0.4, 0);
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 0.5;
	static #SENSITIVITY = 0.075;

	#activeKeyCodes;
	#cameraVelocity;

	/**
	 * @param {import("../../../../src/Instance.js").InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		/**
		 * @type {Record.<String, Boolean>}
		 */
		this.#activeKeyCodes = {};
		this.#cameraVelocity = new Vector3(0, 0, 0);

		document.addEventListener("keydown", event => {
			const keyCode = event.code;

			if (!this.#activeKeyCodes[keyCode]) {
				this.#onKeyDown(keyCode);
			}

			this.#activeKeyCodes[keyCode] = true;
		});

		document.addEventListener("keyup", event => {
			const keyCode = event.code;

			if (this.#activeKeyCodes[keyCode]) {
				this.#onKeyUp(keyCode);
			}

			this.#activeKeyCodes[keyCode] = false;
		});

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

		this.#accelerate(deltaTime, this.#cameraVelocity);
		this.#cameraVelocity.add(DevInstance.#GRAVITY);

		playerMesh.getPosition().add(this.#cameraVelocity);

		const right = new Vector3(0, 1, 0).cross(camera.getForward()).normalize();
		const fpsForward = new Vector3(right).cross(new Vector3(0, 1, 0)).normalize();

		const xAmount = right.multiplyScalar(this.#cameraVelocity[0]);
		const zAmount = fpsForward.multiplyScalar(this.#cameraVelocity[2]);

		playerMesh.getPosition().add(xAmount).add(zAmount);
		playerMesh.updateWorld();

		if (playerMesh.getProxyGeometry()) {
			this.#testCollide(otherPhysicMeshes, playerMesh, this.#cameraVelocity);
		}

		renderer.writeMeshWorld(playerMeshIndex, playerMesh.getWorld());

		camera.getPosition().set(playerMesh.getPosition());
		camera.update();

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(1),
			"Position": camera.getPosition(),
			"Velocity": this.#cameraVelocity,
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Number} deltaTime
	 * @param {Vector3} velocity
	 */
	#accelerate(deltaTime, velocity) {
		velocity.set(new Vector3(0, 0, 0));

		if (this.#activeKeyCodes["KeyW"]) {
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
		}

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
	 * @param {String} keyCode
	 */
	#onKeyDown(keyCode) {}

	/**
	 * @param {String} keyCode
	 */
	#onKeyUp(keyCode) {}

	/**
	 * @param {MouseEvent} event
	 */
	#onMouseMove(event) {
		if (!this._renderer.isPointerLocked()) {
			return;
		}

		const camera = this._renderer.getCamera();

		if (!(camera instanceof PerspectiveCamera)) {
			return;
		}

		const xOffset = -event.movementX * DevInstance.#SENSITIVITY;
		const yOffset = -event.movementY * DevInstance.#SENSITIVITY;

		camera.applyYawAndPitch(xOffset, yOffset);
	}
}