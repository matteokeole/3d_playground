import {Instance as _Instance, Camera, Hitbox} from "../../src/index.js";
import {BoxGeometry} from "../../src/Geometry/index.js";
import {Vector3} from "../../src/math/index.js";
import {keys} from "../hl2/input.js";
import {Mesh} from "../hl2/Mesh.js";
import {VELOCITY} from "./main.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const camera = this._renderer.getCamera();

		if (camera.getCaptureSession() !== null) {
			// Read session
			camera.readCaptureSession(this._frameIndex);
			camera.captureLookAt();

			camera.update();

			this.getDebugger().update(camera);

			return;
		}

		const cameraDirection = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(VELOCITY);
		const cameraRelativeVelocity = camera.getRelativeVelocity(cameraDirection);

		const scene = this._renderer.getScene();
		/**
		 * @type {Mesh[]}
		 */
		const meshes = scene.getMeshes();
		const cameraMeshes = meshes.filter(mesh => mesh.isTiedToCamera());
		const staticBoxMeshes = meshes.filter(mesh => (
			mesh.getGeometry() instanceof BoxGeometry &&
			!mesh.isTiedToCamera() &&
			mesh.getHitbox().getVelocity().isNull()
		));

		let cameraTargetHasChanged = false;

		for (const cameraMesh of cameraMeshes) {
			// Update the position of meshes tied to the camera
			this.#updateCameraMesh(camera, cameraMesh);

			for (const staticBoxMesh of staticBoxMeshes) {
				const props = this.#testCollide(cameraMesh, staticBoxMesh);

				if (!cameraTargetHasChanged) {
					camera.target.add(props.scaledVelocity);

					cameraTargetHasChanged = true;
				}

				cameraMesh.getHitbox().setVelocity(props.velocity ?? cameraRelativeVelocity);
			}
		}

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
	 */
	#testCollide(player, wall) {
		const normal = new Vector3();
		const collisionTime = Hitbox.sweptAabb(player.getHitbox(), wall.getHitbox(), normal);
		const scaledVelocity = new Vector3(player.getHitbox().getVelocity()).multiplyScalar(collisionTime);
		const remainingTime = 1 - collisionTime;
		const dot = (player.getHitbox().getVelocity()[0] * normal[2] + player.getHitbox().getVelocity()[2] * normal[0]) * remainingTime;
		const velocity = new Vector3(dot * normal[2], 0, dot * normal[0]);

		if (velocity.isNull()) {
			return {
				scaledVelocity,
			};
		}

		return {
			velocity,
			scaledVelocity,
		};
	}

	/**
	 * @param {Camera} camera
	 * @param {Mesh} mesh
	 */
	#updateCameraMesh(camera, mesh) {
		mesh.setPosition(camera.getPosition());
		mesh.getHitbox().getAabb().setPosition(camera.getPosition());
	}
}