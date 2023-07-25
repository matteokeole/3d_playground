export class Texture {
	/**
	 * @private
	 * @type {WebGLTexture}
	 */
	#texture;

	/**
	 * @private
	 * @type {Image}
	 */
	#image;

	/**
	 * @param {WebGLTexture} texture
	 * @param {Image} image
	 */
	constructor(texture, image) {
		this.#texture = texture;
		this.#image = image;
	}

	/** @returns {WebGLTexture} */
	get texture() {
		return this.#texture;
	}

	/** @returns {Image} */
	get image() {
		return this.#image;
	}
}