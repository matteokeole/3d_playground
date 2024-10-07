import {Matrix3} from "../math/index.js";

/**
 * @typedef {Object} MaterialDescriptor
 * @property {Matrix3} textureMatrix
 * @property {Number} textureIndex
 * @property {Number} normalMapIndex
 */

/**
 * @deprecated Use Material instead
 */
export class TextureMaterial {
	#textureMatrix;
	#textureIndex;
	#normalMapIndex;

	/**
	 * @param {MaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
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