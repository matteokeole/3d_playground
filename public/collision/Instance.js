import {Instance as _Instance} from "../../src/index.js";
import {Vector2, Vector3} from "../../src/math/index.js";
import {keys} from "./input.js";
import {Mesh} from "./Mesh.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const scene = this._renderer.getScene();
		let player = null;
		let wall = null;

		if (scene.getMeshes().length === 3) {
			player = scene.getMeshes().at(-1);
			wall = scene.getMeshes().at(-2);
		}

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

			if (player) {
				camera.target[0] = player.getPosition()[0];
				camera.target[2] = player.getPosition()[2];
			}

			if (hasMoved) {
				const relativeVelocity = camera.getRelativeVelocity(direction);

				if (!wall || !this.#collide(relativeVelocity, player, wall)) {
					camera.target.add(relativeVelocity);
				}
			}

			camera.getPosition().lerp(camera.target, CAMERA_LERP_FACTOR);
		}

		camera.update();

		this._renderer.getScene().getPointLight().setPosition(camera.getPosition());

		document.getElementById("DebugPosition").textContent = `${camera.getPosition()}`;
		document.getElementById("DebugRotation").textContent = `${camera.getRotation()}`;
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Vector3} velocity
	 * @param {Mesh} player
	 * @param {Mesh} wall
	 */
	#collide(velocity, player, wall) {
		player.getHitbox().setVelocity(velocity);

		const time = player.getHitbox().sweptAABB(wall.getHitbox(), new Vector3());

		if (time === 0) return true;

		velocity = new Vector3(velocity).multiplyScalar(time);

		player.getPosition().add(new Vector3(
			velocity[0],
			0,
			velocity[2],
		));

		player.getHitbox().setPosition(player.getPosition());

		return false;
	}
}