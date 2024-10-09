import {NotImplementedError} from "../Error/index.js";

/**
 * A 2D slice of an application.
 */
export class Layer {
	#name;

	/**
	 * @param {String} name
	 */
	constructor(name) {
		this.#name = name;
	}

	getName() {
		return this.#name;
	}

	/**
	 * @param {Number} deltaTime
	 */
	update(deltaTime) {
		throw new NotImplementedError();
	}
}