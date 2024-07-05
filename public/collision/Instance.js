import {Instance as _Instance, Camera, Hitbox} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {Mesh} from "../hl2/Mesh.js";
import {keys} from "./input.js";
import {VELOCITY} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const scene = this._renderer.getScene();
		/**
		 * @type {Mesh}
		 */
		const playerHitbox = scene
			.getMeshes()
			.find(mesh => mesh.getDebugName() === "playerHitbox");
		/**
		 * @type {Mesh}
		 */
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

		// const hasMoved = direction.magnitude() !== 0;

		const relativeVelocity = camera.getRelativeVelocity(direction);

		playerHitbox.setPosition(camera.getPosition());
		playerHitbox.getHitbox().setPosition(camera.getPosition());
		playerHitbox.getHitbox().setVelocity(relativeVelocity);

		this.#testCollide(playerHitbox, wall, camera);

		// camera.getPosition().lerp(camera.target, CAMERA_LERP_FACTOR);
		camera.getPosition().set(camera.target);

		camera.update();

		this.getDebugger().update({
			positionElement: camera.getPosition(),
			rotationElement: camera.getRotation(),
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Mesh} player
	 * @param {Mesh} wall
	 * @param {Camera} camera
	 */
	#testCollide(player, wall, camera) {
		const normal = new Vector3();
		const collisionTime = Hitbox.sweptAabb(player.getHitbox(), wall.getHitbox(), normal);
		const scaledVelocity = new Vector3(player.getHitbox().getVelocity()).multiplyScalar(collisionTime);

		camera.target.add(scaledVelocity);

		// const remainingTime = 1 - collisionTime;
	}
}