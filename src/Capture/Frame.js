import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} FrameDescriptor
 * @property {Vector3} position
 * @property {Vector3} rotation
 */

export class Frame {
	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	#rotation;

	/**
	 * @param {FrameDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#rotation = descriptor.rotation;
	}

	getPosition() {
		return this.#position;
	}

	getRotation() {
		return this.#rotation;
	}
}