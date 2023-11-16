import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "../hl2/main.js";
import {keys} from "./input.js";

export class Instance extends _Instance {
	_update() {
		const camera = this._renderer.getCamera();

		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(VELOCITY);

		if (direction.magnitude() !== 0) {
			const relativeVelocity = camera.getRelativeVelocity(direction);

			camera.target.add(relativeVelocity);
		}

		camera.position.lerp(camera.target, CAMERA_LERP_FACTOR);
		camera.update();

		document.getElementById("DebugPosition").textContent = `${camera.position}`;
		document.getElementById("DebugRotation").textContent = `${camera.rotation}`;
	}

	_render() {
		this._renderer.render();
	}
}