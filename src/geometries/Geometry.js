import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} GeometryDescriptor
 * @property {Uint8Array} indices
 * @property {Float32Array} vertices
 * @property {Float32Array} normals
 * @property {Float32Array} uvs
 */

/**
 * @abstract
 */
export class Geometry {
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
	 * @type {Float32Array}
	 */
	_tangents;

	/**
	 * @param {GeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#indices = descriptor.indices;
		this.#vertices = descriptor.vertices;
		this.#normals = descriptor.normals;
		this.#uvs = descriptor.uvs;
		this._tangents = Float32Array.of();
	}

	getIndices() {
		return this.#indices;
	}

	getVertices() {
		return this.#vertices;
	}

	getNormals() {
		return this.#normals;
	}

	getUVs() {
		return this.#uvs;
	}

	getTangents() {
		return this._tangents;
	}
}