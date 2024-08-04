import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "../hl2/main.js";
import {keys} from "./input.js";

export class Instance extends _Instance {
	_update() {
		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(VELOCITY);

		const camera = this._renderer.getCamera();

		camera.getPosition().add(camera.getRelativeVelocity(direction));
		camera.update();

		// @ts-ignore
		document.getElementById("DebugPosition").textContent = camera.getPosition();
		// @ts-ignore
		document.getElementById("DebugRotation").textContent = camera.getRotation();
	}

	_render() {
		this._renderer.render();
	}
}