import {AssertionError, NotImplementedError} from "../Error/index.js";

/**
 * @abstract
 */
export class Test {
	/**
	 * @abstract
	 */
	async execute() {
		throw new NotImplementedError();
	}

	/**
	 * @param {Boolean} condition
	 * @param {String} [message]
	 */
	assert(condition, message) {
		if (!condition) {
			throw new AssertionError(message);
		}
	}

	createTestCanvas() {
		const canvas = document.createElement("canvas");

		document.body.appendChild(canvas);

		return canvas;
	}
}