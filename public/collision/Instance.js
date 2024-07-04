import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {Mesh} from "../hl2/Mesh.js";
import {keys} from "./input.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const scene = this._renderer.getScene();
		const playerHitbox = scene
			.getMeshes()
			.find(mesh => mesh.getDebugName() === "playerHitbox");
		const camera = this._renderer.getCamera();

		if (camera.getCaptureSession() !== null) {
			// Read session
			camera.readCaptureSession(this._frameIndex);
			camera.captureLookAt();

			camera.update();

			this.getDebugger().update(camera);

			return;
		}

		// Camera-space direction
		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(VELOCITY);

		const hasMoved = direction.magnitude() !== 0;

		if (playerHitbox) {
			playerHitbox.setPosition(camera.getPosition());
		}

		if (hasMoved) {
			const relativeVelocity = camera.getRelativeVelocity(direction);

			// if (!wall || !this.#collide(relativeVelocity, player, wall)) {
				camera.target.add(relativeVelocity);
			// }
		}

		camera.getPosition().lerp(camera.target, CAMERA_LERP_FACTOR);

		camera.update();

		this.getDebugger().update(camera);
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