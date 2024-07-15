import {Material} from "./Material/index.js";
import {Mesh} from "./Mesh/index.js";

export class Scene {
	#meshes;
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