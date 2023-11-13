/**
 * @abstract
 */
export class Loader {
	/**
	 * @abstract
	 * @param {String} path
	 * @returns {Promise.<*>}
	 */
	async load(path) {}
}