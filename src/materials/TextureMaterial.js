import {AbstractMaterial} from "./AbstractMaterial.js";
import {Texture} from "../index.js";
import {Matrix3} from "../math/index.js";

export class TextureMaterial extends AbstractMaterial {
	/**
	 * @type {Matrix3}
	 */
	#textureMatrix;

	/**
	 * @type {Texture}
	 */
	#texture;

	/**
	 * @type {Texture}
	 */
	#normalMap;

	/**
	 * @param {Object} options
	 * @param {Matrix3} options.textureMatrix
	 * @param {Texture} options.texture
	 * @param {Texture} options.normalMap
	 */
	constructor({textureMatrix, texture, normalMap}) {
		super();

		this.#textureMatrix = textureMatrix;
		this.#texture = texture;
		this.#normalMap = normalMap;
	}

	/**
	 * @returns {Matrix3}
	 */
	get textureMatrix() {
		return this.#textureMatrix;
	}

	/**
	 * @returns {Texture}
	 */
	get texture() {
		return this.#texture;
	}

	/**
	 * @returns {Texture}
	 */
	get normalMap() {
		return this.#normalMap;
	}
}