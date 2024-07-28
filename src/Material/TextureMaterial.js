import {Matrix3} from "../math/index.js";
import {Material} from "./Material.js";

/**
 * @typedef {Object} MaterialDescriptor
 * @property {Matrix3} textureMatrix
 * @property {Number} textureIndex
 * @property {Number} normalMapIndex
 */

export class TextureMaterial extends Material {
	#textureMatrix;
	#textureIndex;
	#normalMapIndex;

	/**
	 * @param {MaterialDescriptor} descriptor
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