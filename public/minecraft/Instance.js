import {Instance as _Instance} from "../../src/index.js";
import {Keybind, keys} from "./input.js";
import {VELOCITY, VELOCITY_SQRT1_2} from "./main.js";

const diagonalMovement = () =>
	(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
	(keys.has(Keybind.left) || keys.has(Keybind.right));

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const camera = this._renderer.getCamera();

		// Update camera
		{
			const velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * delta;

			if (keys.has("KeyW")) camera.moveZ(velocity);
			if (keys.has("KeyS")) camera.moveZ(-velocity);
			if (keys.has("KeyA")) camera.truck(-velocity);
			if (keys.has("KeyD")) camera.truck(velocity);
			if (keys.has("Space")) camera.moveY(velocity);
			if (keys.has("ControlLeft")) camera.moveY(-velocity);

			camera.update();
		}

		// Update point light
		{
			const pointLight = this._renderer.getScene().getPointLight();
			pointLight.getPosition()[2] = Math.sin(this._frameIndex * .005) + 2.5;
			pointLight.update();
		}

		document.getElementById("DebugPosition").textContent = `${camera.getPosition()}`;
		document.getElementById("DebugRotation").textContent = `${camera.getRotation()}`;
		document.getElementById("DebugDelta").textContent = delta.toFixed(2);
	}

	_render() {
		this._renderer.render();
	}
}