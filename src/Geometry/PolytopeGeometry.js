/**
 * @typedef {Object} PolytopeGeometryDescriptor
 * @property {Float32Array} vertices
 * @property {Uint8Array} indices
 */

export class PolytopeGeometry {
	#vertices;
	#indices;

	/**
	 * @param {PolytopeGeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#vertices = descriptor.vertices;
		this.#indices = descriptor.indices;
	}

	getVertices() {
		return this.#vertices;
	}

	getIndices() {
		return this.#indices;
	}
}