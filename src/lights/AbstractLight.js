import {Vector3} from "../math/index.js";

/**
 * @abstract
 */
export class AbstractLight {
	/**
	 * @type {Vector3}
	 */
	#color;

	/**
	 * @type {Number}
	 */
	#intensity;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.color
	 * @param {Number} options.intensity
	 */
	constructor({color, intensity}) {
		this.#color = color;
		this.#intensity = intensity;
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