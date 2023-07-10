/** @abstract */
export class Geometry {
	/**
	 * @protected
	 * @type {Uint8Array}
	 */
	#indices;

	/**
	 * @protected
	 * @type {Float32Array}
	 */
	#vertices;

	/**
	 * @protected
	 * @type {Float32Array}
	 */
	#normals;

	/**
	 * @protected
	 * @type {Float32Array}
	 */
	#uvs;

	/**
	 * @param {Object} options
	 * @param {Uint8Array} options.indices
	 * @param {Float32Array} options.vertices
	 * @param {Float32Array} options.normals
	 * @param {Float32Array} options.uvs
	 */
	constructor({indices, vertices, normals, uvs}) {
		this.#indices = indices;
		this.#vertices = vertices;
		this.#normals = normals;
		this.#uvs = uvs;
	}

	/** @returns {Uint8Array} */
	get indices() {
		return this.#indices;
	}

	/** @returns {Float32Array} */
	get vertices() {
		return this.#vertices;
	}

	/** @returns {Float32Array} */
	get normals() {
		return this.#normals;
	}

	/** @returns {Float32Array} */
	get uvs() {
		return this.#uvs;
	}
}