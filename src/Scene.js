import {Mesh} from "./Mesh.js";

export class Scene {
	/**
	 * @type {Mesh[]}
	 */
	#meshes;

	/**
	 * @param {Mesh[]} meshes
	 */
	constructor(meshes) {
		this.#meshes = meshes;
	}

	getMeshes() {
		return this.#meshes;
	}
}