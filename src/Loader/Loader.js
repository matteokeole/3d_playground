/**
 * @abstract
 */
export class Loader {
	/**
	 * @abstract
	 * @param {*} source
	 * @returns {Promise.<*>}
	 */
	async load(source) {}
}