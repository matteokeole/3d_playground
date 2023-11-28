import {Vector2} from "./math/index.js";

/**
 * @typedef {Object} TextureImageDescriptor
 * @property {HTMLImageElement} image
 * @property {Vector2} viewport
 * @property {Number} zOffset
 */

/**
 * Represents a sub-rectangle in a WebGL texture array.
 */
export class TextureImage {
	/**
	 * @type {HTMLImageElement}
	 */
	#image;

	/**
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @type {Number}
	 */
	#zOffset;

	/**
	 * @param {TextureImageDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#image = descriptor.image;
		this.#viewport = descriptor.viewport;
		this.#zOffset = descriptor.zOffset;
	}

	getImage() {
		return this.#image;
	}

	getViewport() {
		return this.#viewport;
	}

	/**
	 * Returns the depth index of this sub-rectangle in the texture array.
	 */
	getZOffset() {
		return this.#zOffset;
	}
}