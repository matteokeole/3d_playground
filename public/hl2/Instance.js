import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {keys} from "./input.js";
import {VELOCITY} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {
		const camera = this._renderer.getCamera();

		if (camera.getCaptureSession() !== null) {
			// Read session
			camera.readCaptureSession(this._frameIndex);
			camera.captureLookAt();
		} else {
			// Camera-space direction
			const direction = new Vector3(
				keys.KeyA + keys.KeyD,
				keys.ControlLeft + keys.Space,
				keys.KeyW + keys.KeyS,
			)
				.normalize()
				.multiplyScalar(VELOCITY);

			const hasMoved = direction.magnitude() !== 0;

			if (hasMoved) {
				const relativeVelocity = camera.getRelativeVelocity(direction);

				camera.getPosition().add(relativeVelocity);
			}
		}

		camera.update();

		this._renderer.getScene().getPointLight().setPosition(camera.getPosition());

		document.getElementById("DebugPosition").textContent = `${camera.getPosition()}`;
		document.getElementById("DebugRotation").textContent = `${camera.getRotation()}`;
	}

	_render() {
		this._renderer.render();
	}
}