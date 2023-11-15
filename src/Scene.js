import {AbstractMesh} from "./index.js";

export class Scene {
	/**
	 * @type {AbstractMesh[]}
	 */
	#meshes;

	/**
	 * @param {AbstractMesh[]} meshes
	 */
	constructor(meshes) {
		this.#meshes = meshes;
	}

	getMeshes() {
		return this.#meshes;
	}
}