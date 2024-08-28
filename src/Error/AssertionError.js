export class AssertionError extends Error {
	/**
	 * @param {?String} message
	 */
	constructor(message) {
		super(`Assertion failed${message ? `: ${message}` : ""}`);
	}
}