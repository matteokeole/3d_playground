import {Instance as _Instance} from "../../src/index.js";
import {EPA} from "../../src/Algorithm/EPA.js";
import {GJK} from "../../src/Algorithm/GJK.js";
import {PerspectiveCamera} from "../../src/Camera/index.js";
import {Vector3} from "../../src/math/index.js";
import {Mesh} from "../../src/Mesh/index.js";

export class Instance extends _Instance {
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 0.5;
	static #SENSITIVITY = 0.075;

	#activeKeyCodes;
	#cameraVelocity;

	/**
	 * @param {import("../../src/Instance.js").InstanceDescriptor} descriptor
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
		 * @type {PerspectiveCamera}
		 */
		const camera = this._renderer.getCamera();

		this.#accelerate(deltaTime, this.#cameraVelocity);

		camera.applyVelocity(this.#cameraVelocity);

		this.#updateCameraMeshes();

		camera.update();

		this.getDebugger().update({
			positionElement: camera.getPosition(),
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
		if (this.#activeKeyCodes["KeyW"]) {
			velocity[2] = Instance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyS"]) {
			velocity[2] = -Instance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyA"]) {
			velocity[0] = -Instance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyD"]) {
			velocity[0] = Instance.#CAMERA_SPEED;
		}

		velocity.multiplyScalar(Instance.#FRICTION);

		this.getDebugger().update({
			"Velocity": velocity,
		});
	}

	/**
	 * @param {Mesh} player
	 * @param {Mesh} wall
	 */
	/* #testCollideAabb(player, wall) {
		const normal = new Vector3();
		const collisionTime = Hitbox.sweptAabb(player.getHitbox(), wall.getHitbox(), normal);
		const scaledVelocity = new Vector3(player.getHitbox().getVelocity()).multiplyScalar(collisionTime);
		const remainingTime = 1 - collisionTime;
		const dot = (player.getHitbox().getVelocity()[0] * normal[2] + player.getHitbox().getVelocity()[2] * normal[0]) * remainingTime;
		const velocity = new Vector3(dot * normal[2], 0, dot * normal[0]);

		if (velocity.isNull()) {
			return {
				scaledVelocity,
			};
		}

		return {
			velocity,
			scaledVelocity,
		};
	} */

	/**
	 * @param {Mesh} dynamicMesh
	 * @param {Mesh} staticMesh
	 */
	#testCollideGjkEpa(dynamicMesh, staticMesh) {
		const simplex = GJK.test3d(dynamicMesh, staticMesh);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		const collision = EPA.test3d(dynamicMesh, staticMesh, simplex);

		if (!collision) {
			return null;
		}

		const force = collision.normal.multiplyScalar(collision.depth);

		dynamicMesh.getPosition().subtract(force);
		dynamicMesh.updateWorld();

		return force;
	}

	#updateCameraMeshes() {
		const camera = this._renderer.getCamera();
		const scene = this._renderer.getScene();
		/**
		 * @type {Mesh[]}
		 */
		const meshes = scene.getMeshes();
		const cameraMeshes = [];
		const staticBoxMeshes = [];

		for (const cameraMesh of cameraMeshes) {
			// Update the position of meshes tied to the camera
			cameraMesh.setPosition(camera.getPosition());
			// cameraMesh.getHitbox().getAabb().setPosition(camera.getPosition());
			cameraMesh.updateWorld();

			for (const staticBoxMesh of staticBoxMeshes) {
				const force = this.#testCollideGjkEpa(cameraMesh, staticBoxMesh);

				if (force !== null) {
					camera.getPosition().subtract(force);
				}
			}
		}
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

		/**
		 * @type {PerspectiveCamera}
		 */
		const camera = this._renderer.getCamera();

		const xOffset = -event.movementX * Instance.#SENSITIVITY;
		const yOffset = -event.movementY * Instance.#SENSITIVITY;

		camera.applyYawAndPitch(xOffset, yOffset);
	}

	/* #useCaptureSession() {
		const camera = this._renderer.getCamera();

		camera.readCaptureSession(this._frameIndex);
		camera.captureLookAt();
		camera.update();

		this.getDebugger().update(camera);
	} */
}