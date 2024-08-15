/**
 * @abstract
 */
export class Loader {
	/**
	 * @abstract
	 * @param {String} url
	 * @returns {Promise.<*>}
	 */
	async load(url) {
		throw new Error("Not implemented");
	}
}