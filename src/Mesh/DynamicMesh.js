import {Mesh} from "./Mesh.js";

/**
 * @typedef {Object} DynamicMeshDescriptor
 * @property {Number} [mass] In kg
 */

export class DynamicMesh extends Mesh {
	#mass;

	/**
	 * @param {import("./Mesh.js").MeshDescriptor & DynamicMeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#mass = descriptor.mass ?? 0;
	}

	getMass() {
		return this.#mass;
	}
}