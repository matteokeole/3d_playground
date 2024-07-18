import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} LightDescriptor
 * @property {Vector3} color
 * @property {Number} intensity
 */

/**
 * @abstract
 */
export class Light {
	/**
	 * @type {Vector3}
	 */
	#color;

	/**
	 * @type {Number}
	 */
	#intensity;

	/**
	 * @param {LightDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#color = descriptor.color;
		this.#intensity = descriptor.intensity;
	}

	/**
	 * @returns {Vector3}
	 */
	get color() {
		return this.#color;
	}

	/**
	 * @returns {Number}
	 */
	get intensity() {
		return this.#intensity;
	}
}