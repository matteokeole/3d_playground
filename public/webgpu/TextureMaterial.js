import {Material} from "../../src/materials/index.js";
import {Matrix3} from "../../src/math/index.js";

/**
 * @typedef {Object} TextureMaterialDescriptor
 * @property {Matrix3} textureMatrix
 * @property {Number} textureIndex
 * @property {Number} normalMapIndex
 */

export class TextureMaterial extends Material {
	/**
	 * @type {Matrix3}
	 */
	#textureMatrix;

	/**
	 * @type {Number}
	 */
	#textureIndex;

	/**
	 * @type {Number}
	 */
	#normalMapIndex;

	/**
	 * @param {TextureMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super();

		this.#textureMatrix = descriptor.textureMatrix;
		this.#textureIndex = descriptor.textureIndex;
		this.#normalMapIndex = descriptor.normalMapIndex;
	}

	getTextureMatrix() {
		return this.#textureMatrix;
	}

	getTextureIndex() {
		return this.#textureIndex;
	}

	getNormalMapIndex() {
		return this.#normalMapIndex;
	}
}