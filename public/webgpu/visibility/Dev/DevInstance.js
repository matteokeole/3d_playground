import {Instance} from "../../../../src/index.js";
import {Vector3} from "../../../../src/math/index.js";

export class DevInstance extends Instance {
	static #FRICTION = 0.9;

	#activeKeyCodes;

	/**
	 * @param {import("../../../../src/Instance.js").InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		/**
		 * @type {Record.<String, Boolean>}
		 */
		this.#activeKeyCodes = {};

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
	}

	/**
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {
		const scene = this._renderer.getScene();
		const camera = this._renderer.getCamera();

		if (!scene || !camera) {
			return;
		}

		const velocity = camera.getVelocity();

		this.#accelerate(deltaTime, velocity);

		camera.getPosition().add(velocity);
		camera.update();

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(2),
			"Position": camera.getPosition(),
			"Rotation": camera.getRotation(),
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
		if (this.#activeKeyCodes["Space"]) {
			velocity[0] = 1;
		}

		const speed = velocity.magnitude();

		if (speed === 0) {
			return;
		}

		const drop = speed * DevInstance.#FRICTION;

		// velocity.multiplyScalar(speed - drop);

		/* const speed = velocity.magnitude();

		if (speed === 0) {
			return;
		}

		const drop = speed * DevInstance.#FRICTION * deltaTime;

		velocity.multiplyScalar(max(speed - drop, 0)); */
	}

	/**
	 * @param {String} keyCode
	 */
	#onKeyDown(keyCode) {}

	/**
	 * @param {String} keyCode
	 */
	#onKeyUp(keyCode) {}
}