import {AbstractLight} from "./AbstractLight.js";
import {Vector3} from "../math/index.js";

export class PointLight extends AbstractLight {
	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	#direction;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.color
	 * @param {Number} options.intensity
	 * @param {Vector3} options.position
	 * @param {Vector3} options.direction
	 */
	constructor({color, intensity, position, direction}) {
		super({color, intensity});

		this.#position = position;
		this.#direction = direction;
	}

	/**
	 * @returns {Vector3}
	 */
	get position() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	/**
	 * @returns {Vector3}
	 */
	get direction() {
		return this.#direction;
	}
}