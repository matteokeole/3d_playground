import {Instance} from "../../../../src/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {rad, Vector3} from "../../../../src/math/index.js";

export class LookAroundDevInstance extends Instance {
	static #SENSITIVITY = 0.075;

	#velocity = new Vector3(0, 0, 0);
	#forwardmove = 0;
	#sidemove = 0;

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
		const camera = this._renderer.getCamera();

		if (!(camera instanceof PerspectiveCamera)) {
			throw new Error("Only PerspectiveCamera instances supported.");
		}

		this.#move(deltaTime);

		camera.getPosition().add(this.#velocity);

		// Camera position must be set before extracting it for the player mesh
		camera.update();

		this.getDebugger().update({
			"Mode": "LookAround",
			"Delta time": deltaTime.toPrecision(3),
			"Camera": "---------------",
			"Position": camera.getPosition(),
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Number} deltaTime
	 */
	#move(deltaTime) {
		/** @type {PerspectiveCamera} */
		const camera = this._renderer.getCamera();

		const forward = camera.getForward();
		const right = camera.getRight();

		forward.normalize();
		right.normalize();

		// Reset movements
		this.#forwardmove = 0;
		this.#sidemove = 0;

		const forwardKeyState = this.getActiveKeyCodes()["KeyW"] ? 1 : 0;
		const backKeyState = this.getActiveKeyCodes()["KeyS"] ? 1 : 0;

		this.#forwardmove += forwardKeyState;
		this.#forwardmove -= backKeyState;

		const rightKeyState = this.getActiveKeyCodes()["KeyD"] ? 1 : 0;
		const leftKeyState = this.getActiveKeyCodes()["KeyA"] ? 1 : 0;

		this.#sidemove += rightKeyState;
		this.#sidemove -= leftKeyState;

		const wishvel = new Vector3(0, 0, 0);
		wishvel[0] = forward[0] * this.#forwardmove + right[0] * this.#sidemove;
		wishvel[1] = forward[1] * this.#forwardmove + right[1] * this.#sidemove;
		wishvel[2] = forward[2] * this.#forwardmove + right[2] * this.#sidemove;

		const wishdir = new Vector3(wishvel);
		wishdir.normalize();

		wishdir.multiplyScalar(0.04);

		this.#velocity.set(wishdir);
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

		const pitch = this.getMouseYAxis(event) * LookAroundDevInstance.#SENSITIVITY;
		const yaw = this.getMouseXAxis(event) * LookAroundDevInstance.#SENSITIVITY;

		camera.rotate(new Vector3(rad(pitch), rad(yaw), 0));
	}
}