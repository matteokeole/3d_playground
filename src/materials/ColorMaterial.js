import {AbstractMaterial} from "./AbstractMaterial.js";
import {Vector3} from "../math/index.js";

export class ColorMaterial extends AbstractMaterial {
	/**
	 * @type {Vector3}
	 */
	#color;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.color
	 */
	constructor({color}) {
		super();

		this.#color = color;
	}

	/**
	 * @returns {Vector3}
	 */
	get color() {
		return this.#color;
	}
}