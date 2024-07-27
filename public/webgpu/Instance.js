import {Instance as _Instance, Camera} from "../../src/index.js";
import {EPA, GJK} from "../../src/Algorithm/index.js";
import {Vector3} from "../../src/math/index.js";
import {Mesh} from "../../src/Mesh/Mesh.js";
import {keys} from "./input.js";

const VELOCITY = .2;

export class Instance extends _Instance {
	_update() {
		const scene = this._renderer.getScene();
		const camera = this._renderer.getCamera();

		if (!scene || !camera) {
			return;
		}

		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		);
		direction.normalize();
		direction.multiplyScalar(VELOCITY);

		const relativeVelocity = camera.getRelativeVelocity(direction);

		camera.getPosition().add(relativeVelocity);

		const cameraHull = camera.getHull();

		if (cameraHull) {
			const staticMeshes = scene.getMeshes();

			this.#updateCameraHull(camera, cameraHull, staticMeshes);
		}

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
	 * @param {Camera} camera
	 * @param {Mesh} hull
	 * @param {Mesh[]} staticMeshes
	 */
	#updateCameraHull(camera, hull, staticMeshes) {
		hull.setPosition(camera.getPosition());
		hull.updateProjection();

		for (let i = 0; i < staticMeshes.length; i++) {
			const staticMesh = staticMeshes[i];
			const hitResponse = this.#hitTest(hull, staticMesh);

			if (!hitResponse) {
				continue;
			}

			const force = hitResponse.normal.multiplyScalar(hitResponse.depth);

			hull.getPosition().subtract(force);
			hull.updateProjection();
		}

		camera.setPosition(hull.getPosition());
	}

	/**
	 * @param {Mesh} dynamicMesh
	 * @param {Mesh} staticMesh
	 */
	#hitTest(dynamicMesh, staticMesh) {
		const simplex = GJK.test3d(dynamicMesh, staticMesh);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		return EPA.test3d(dynamicMesh, staticMesh, simplex);
	}
}