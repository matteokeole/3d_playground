import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {CAMERA_LERP_FACTOR} from "../hl2/main.js";
import {keys} from "./input.js";

export class Instance extends _Instance {
	_update() {
		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(.05);

		const camera = this._renderer.getCamera();

		camera.target.add(camera.getRelativeVelocity(direction));
		camera.getPosition().lerp(camera.target, CAMERA_LERP_FACTOR);
		camera.update();

		document.getElementById("DebugPosition").textContent = `${camera.getPosition()}`;
		document.getElementById("DebugRotation").textContent = `${camera.getRotation()}`;
	}

	_render() {
		this._renderer.render();
	}
}