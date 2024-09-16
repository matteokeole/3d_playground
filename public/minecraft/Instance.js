import {PerspectiveCamera} from "../../src/Camera/index.js";
import {Instance as _Instance} from "../../src/index.js";
import {VELOCITY, VELOCITY_SQRT1_2} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {
		/**
		 * @type {PerspectiveCamera}
		 */
		const camera = this._renderer.getCamera();

		// Update camera
		{
			/* const velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * deltaTime;

			if (keys.has("KeyW")) camera.moveZ(velocity);
			if (keys.has("KeyS")) camera.moveZ(-velocity);
			if (keys.has("KeyA")) camera.truck(-velocity);
			if (keys.has("KeyD")) camera.truck(velocity);
			if (keys.has("Space")) camera.moveY(velocity);
			if (keys.has("ControlLeft")) camera.moveY(-velocity); */

			camera.update();
		}

		// Update point light
		{
			const pointLight = this._renderer.getScene().getPointLight();
			pointLight.getPosition()[2] = Math.sin(this._frameIndex * .005) + 2.5;
			pointLight.update();
		}

		this.getDebugger().update({
			"Delta time": deltaTime.toPrecision(1),
			"Position": camera.getPosition(),
			"Forward": camera.getForward(),
		});
	}

	_render() {
		this._renderer.render();
	}
}