import {Instance as _Instance, Hitbox} from "../../src/index.js";
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
		const wall = scene
			.getMeshes()
			.find(mesh => mesh.getDebugName() === "wall");

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

		playerHitbox.setPosition(camera.getPosition());

		const relativeVelocity = camera.getRelativeVelocity(direction);
		const collisionResult = this.#collide(relativeVelocity, playerHitbox, wall);

		if (hasMoved) {
			camera.target.add(relativeVelocity);
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

		const normal = new Vector3();
		const collisionTime = Hitbox.sweptAabb(player.getHitbox(), wall.getHitbox(), normal);

		if (collisionTime === 0) {
			return true;
		}

		player.getPosition()[0] += player.getHitbox().getVelocity()[0] * collisionTime;
		player.getPosition()[2] += player.getHitbox().getVelocity()[2] * collisionTime;

		const remainingTime = 1 - collisionTime;

		/**
		 * @todo Collision response
		 */

		// player.getHitbox().setPosition(player.getPosition());

		return false;
	}
}