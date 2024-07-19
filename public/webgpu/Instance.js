import {Instance as _Instance} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {keys} from "./input.js";

const SPEED = .1;

export class Instance extends _Instance {
	_update() {
		this.#testCollisions();

		const camera = this._renderer.getCamera();
		const direction = new Vector3(
			keys.KeyA + keys.KeyD,
			keys.ControlLeft + keys.Space,
			keys.KeyW + keys.KeyS,
		)
			.normalize()
			.multiplyScalar(SPEED);

		camera.getPosition().add(camera.getRelativeVelocity(direction));

		this.#updateDynamicMesh();

		camera.update();

		this.getDebugger().update({
			positionElement: camera.getPosition(),
			rotationElement: camera.getRotation(),
		});
	}

	_render() {
		this._renderer.render();
	}

	#testCollisions() {
		const meshes = this._renderer.getScene().getMeshes();
		const dynamicMesh = meshes[0];
		const staticMesh = meshes[1];

		/**
		 * @todo Test GJK between the static and dynamic meshes
		 */
	}

	#updateDynamicMesh() {
		const camera = this._renderer.getCamera();
		const dynamicMeshIndex = 0;
		const dynamicMesh = this._renderer.getScene().getMeshes()[dynamicMeshIndex];
		const dynamicMeshBuffer = this._renderer.getMeshBuffer(dynamicMesh);
		const offset = 16 * dynamicMeshIndex * Float32Array.BYTES_PER_ELEMENT;

		dynamicMesh.setPosition(camera.getPosition());
		dynamicMesh.updateProjection();

		this._renderer.writeMeshBuffer(dynamicMeshBuffer, offset, dynamicMesh.getProjection());
	}
}