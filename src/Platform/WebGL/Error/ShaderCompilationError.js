export class ShaderCompilationError extends Error {
	/**
	 * @param {String} log
	 */
	constructor(log) {
		super(log);
	}
}