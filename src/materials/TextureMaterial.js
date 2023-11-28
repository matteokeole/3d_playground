import {Material} from "./Material.js";
import {TextureImage} from "../index.js";
import {Matrix3} from "../math/index.js";

export class Material extends Material {
	/**
	 * @type {Matrix3}
	 */
	#textureMatrix;

	/**
	 * @type {TextureImage}
	 */
	#texture;

	/**
	 * @type {TextureImage}
	 */
	#normalMap;

	/**
	 * @param {Object} options
	 * @param {Matrix3} options.textureMatrix
	 * @param {TextureImage} options.texture
	 * @param {TextureImage} options.normalMap
	 */
	constructor({textureMatrix, texture, normalMap}) {
		super();

		this.#textureMatrix = textureMatrix;
		this.#texture = texture;
		this.#normalMap = normalMap;
	}

	get textureMatrix() {
		return this.#textureMatrix;
	}

	get texture() {
		return this.#texture;
	}

	get normalMap() {
		return this.#normalMap;
	}
}