import {Vector3} from "../math/index.js";

/**
 * 
 * @abstract
 */
export class AbstractGeometry {
	/**
	 * @type {Uint8Array}
	 */
	#indices;

	/**
	 * @type {Float32Array}
	 */
	#vertices;

	/**
	 * @type {Float32Array}
	 */
	#normals;

	/**
	 * @type {Float32Array}
	 */
	#uvs;

	/**
	 * @type {?Vector3}
	 */
	#size;

	/**
	 * @param {Object} options
	 * @param {Uint8Array} options.indices
	 * @param {Float32Array} options.vertices
	 * @param {Float32Array} options.normals
	 * @param {Float32Array} options.uvs
	 * @param {?Vector3} options.size
	 */
	constructor({indices, vertices, normals, uvs, size}) {
		this.#indices = indices;
		this.#vertices = vertices;
		this.#normals = normals;
		this.#uvs = uvs;
		this.#size = size;
	}

	/**
	 * @returns {Uint8Array}
	 */
	get indices() {
		return this.#indices;
	}

	/**
	 * @returns {Float32Array}
	 */
	get vertices() {
		return this.#vertices;
	}

	/**
	 * @returns {Float32Array}
	 */
	get normals() {
		return this.#normals;
	}

	/**
	 * @returns {Float32Array}
	 */
	get uvs() {
		return this.#uvs;
	}

	/**
	 * @returns {?Vector3}
	 */
	get size() {
		return this.#size;
	}
}