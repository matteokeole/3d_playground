import {PerspectiveCamera} from "../../src/Camera/index.js";
import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";

export class Instance extends _Instance {
	static #FRICTION = 0.9;
	static #CAMERA_SPEED = 1;
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

		camera.update();

		this._renderer.getScene().getPointLight().setPosition(camera.getPosition());

		this.getDebugger().update({
			"Position": camera.getPosition(),
			"Forward": camera.getForward(),
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
}