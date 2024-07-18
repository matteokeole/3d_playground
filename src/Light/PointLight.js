import {Light} from "./Light.js";
import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} PointLightDescriptor
 * @property {Vector3} position
 * @property {Vector3} direction
 */

export class PointLight extends Light {
	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	#direction;

	/**
	 * @param {import("./Light.js").LightDescriptor & PointLightDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#position = descriptor.position;
		this.#direction = descriptor.direction;
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