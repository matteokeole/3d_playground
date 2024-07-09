import {Mesh} from "./index.js";
import {Material} from "./Material/index.js";

export class Scene {
	/**
	 * @type {Mesh[]}
	 */
	#meshes;

	/**
	 * @type {Material[]}
	 */
	#materials;

	/**
	 * @param {Mesh[]} meshes
	 * @param {Material[]} [materials]
	 */
	constructor(meshes, materials = []) {
		this.#meshes = meshes;
		this.#materials = materials;
	}

	getMeshes() {
		return this.#meshes;
	}

	getMaterials() {
		return this.#materials;
	}
}