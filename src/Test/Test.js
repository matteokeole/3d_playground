import {AssertionError} from "../Error/index.js";

/**
 * @abstract
 */
export class Test {
	/**
	 * @abstract
	 */
	async execute() {
		throw new Error("Not implemented");
	}

	/**
	 * @param {Boolean} condition
	 * @param {String} [message]
	 */
	assert(condition, message) {
		if (condition) {
			return;
		}

		throw new AssertionError(message);
	}

	createTestCanvas() {
		const canvas = document.createElement("canvas");

		document.body.appendChild(canvas);

		return canvas;
	}
}