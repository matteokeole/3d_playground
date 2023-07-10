import {Material} from "./Material.js";

export class TextureMaterial extends Material {
	/**
	 * @private
	 * @type {WebGLTexture}
	 */
	#texture;

	/**
	 * @param {Object} options
	 * @param {WebGLTexture} options.texture
	 */
	constructor({texture}) {
		super();

		this.#texture = texture;
	}

	/** @returns {WebGLTexture} */
	get texture() {
		return this.#texture;
	}
}