import {Light} from "./Light.js";
import {Vector3} from "../math/index.js";

export class DirectionalLight extends Light {
	/**
	 * @private
	 * @type {Vector3}
	 */
	#direction;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.color
	 * @param {Number} options.intensity
	 * @param {Vector3} options.direction
	 */
	constructor({color, intensity, direction}) {
		super({color, intensity});

		this.#direction = direction;
	}

	/** @returns {Vector3} */
	get direction() {
		return this.#direction;
	}
}