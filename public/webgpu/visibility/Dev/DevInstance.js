import {Instance} from "../../../../src/index.js";
import {Camera, PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Vector3} from "../../../../src/math/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {EPA, GJK} from "../../../../src/Algorithm/index.js";
import {Hull} from "../../../../src/Hull/Hull.js";

export class DevInstance extends Instance {
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 2;
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
		const scene = this._renderer.getScene();
		const camera = this._renderer.getCamera();

		if (!(camera instanceof PerspectiveCamera)) {
			throw new Error("Only PerspectiveCamera instances supported.");
		}

		this.#accelerate(deltaTime, this.#cameraVelocity);

		if (camera.getHull()) {
			this.#testCollide(scene, camera, this.#cameraVelocity);
		}

		camera.applyVelocity(this.#cameraVelocity);

		camera.update();

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(1),
			"Position": camera.getPosition(),
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
			velocity[2] = DevInstance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyS"]) {
			velocity[2] = -DevInstance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyA"]) {
			velocity[0] = -DevInstance.#CAMERA_SPEED;
		}
		if (this.#activeKeyCodes["KeyD"]) {
			velocity[0] = DevInstance.#CAMERA_SPEED;
		}

		/**
		 * @todo
		 */
		// velocity.normalize();

		velocity.multiplyScalar(DevInstance.#FRICTION);

		this.getDebugger().update({
			"Velocity": velocity,
		});

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
	 * @param {Scene} scene
	 * @param {Camera} camera
	 * @param {Vector3} velocity
	 */
	#testCollide(scene, camera, velocity) {
		const cameraHull = camera.getHull();
		const hulls = scene.getHulls();

		for (let i = 0; i < hulls.length; i++) {
			const meshHull = hulls[i];
			const hitResponse = this.#hitTest(cameraHull, meshHull);

			if (!hitResponse) {
				continue;
			}

			const force = hitResponse.normal.multiplyScalar(hitResponse.depth);

			/**
			 * @todo Fix blocking edges between geometries
			 */
			camera.getPosition().subtract(force);
			// camera.update();
		}
	}

	/**
	 * @param {Hull} dynamicMeshHull
	 * @param {Hull} staticMeshHull
	 */
	#hitTest(dynamicMeshHull, staticMeshHull) {
		const simplex = GJK.test3d(dynamicMeshHull, staticMeshHull);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		const collision = EPA.test3d(dynamicMeshHull, staticMeshHull, simplex);

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