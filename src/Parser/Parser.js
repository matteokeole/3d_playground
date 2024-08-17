/**
 * @abstract
 */
export class Parser {
	/**
	 * @abstract
	 * @param {*} data
	 * @returns {*}
	 */
	parse(data) {
		throw new Error("Not implemented");
	}
}