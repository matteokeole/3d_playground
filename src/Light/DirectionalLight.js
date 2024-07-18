import {Light} from "./Light.js";
import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} DirectionalLightDescriptor
 * @property {Vector3} direction
 */

export class DirectionalLight extends Light {
	/**
	 * @type {Vector3}
	 */
	#direction;

	/**
	 * @param {import("./Light.js").LightDescriptor & DirectionalLightDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#direction = descriptor.direction;
	}

	/**
	 * @returns {Vector3}
	 */
	get direction() {
		return this.#direction;
	}
}