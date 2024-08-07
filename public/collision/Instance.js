import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {keys} from "../hl2/input.js";
import {Mesh} from "../hl2/Mesh.js";
import {VELOCITY} from "./main.js";
import {GJK} from "../../src/Algorithm/GJK.js";
import {EPA} from "../../src/Algorithm/EPA.js";

export class Instance extends _Instance {
	/**
	 * @param {Number} delta
	 */
	_update(delta) {
		const camera = this._renderer.getCamera();

		if (camera.getCaptureSession() !== null) {
			return this.#useCaptureSession();
		}

		const cameraDirection = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(VELOCITY);

		camera.target.add(camera.getRelativeVelocity(cameraDirection));
		camera.setPosition(camera.target);

		this.#updateCameraMeshes();

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
	/* #testCollideAabb(player, wall) {
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
	} */

	/**
	 * @param {Mesh} dynamicMesh
	 * @param {Mesh} staticMesh
	 */
	#testCollideGjkEpa(dynamicMesh, staticMesh) {
		const simplex = GJK.test3d(dynamicMesh, staticMesh);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		const collision = EPA.test3d(dynamicMesh, staticMesh, simplex);

		if (!collision) {
			return null;
		}

		const force = collision.normal.multiplyScalar(collision.depth);

		dynamicMesh.getPosition().subtract(force);
		dynamicMesh.updateProjection();

		return force;
	}

	#updateCameraMeshes() {
		const camera = this._renderer.getCamera();
		const scene = this._renderer.getScene();
		/**
		 * @type {Mesh[]}
		 */
		const meshes = scene.getMeshes();
		const cameraMeshes = meshes.filter(mesh => mesh.isTiedToCamera());
		const staticBoxMeshes = meshes.filter(mesh => !mesh.isTiedToCamera());

		for (const cameraMesh of cameraMeshes) {
			// Update the position of meshes tied to the camera
			cameraMesh.setPosition(camera.getPosition());
			// cameraMesh.getHitbox().getAabb().setPosition(camera.getPosition());
			cameraMesh.updateProjection();

			for (const staticBoxMesh of staticBoxMeshes) {
				const force = this.#testCollideGjkEpa(cameraMesh, staticBoxMesh);

				if (force !== null) {
					camera.target.subtract(force);
				}
			}
		}
	}

	#useCaptureSession() {
		const camera = this._renderer.getCamera();

		camera.readCaptureSession(this._frameIndex);
		camera.captureLookAt();
		camera.update();

		this.getDebugger().update(camera);
	}
}