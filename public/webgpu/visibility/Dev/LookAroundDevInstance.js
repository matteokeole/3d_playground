import {Instance} from "../../../../src/index.js";
import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {rad, Vector3} from "../../../../src/math/index.js";

export class LookAroundDevInstance extends Instance {
	static #SENSITIVITY = 0.075;

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

		// Camera position must be set before extracting it for the player mesh
		camera.update();

		this.getDebugger().update({
			"Mode": "LookAround",
			"Delta time": deltaTime.toPrecision(3),
			"Camera": "---------------",
			"..Right": camera.getRight(),
			".....Up": camera.getUp(),
			"Forward": camera.getForward(),
		});
	}

	_render() {
		this._renderer.render();
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