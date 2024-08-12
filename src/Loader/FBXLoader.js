import {Loader} from "./Loader.js";

export class FBXLoader extends Loader {
	/**
	 * @type {Loader["load"]}
	 * @returns {Promise.<Object>}
	 */
	async load(url) {
		const response = await super.load(url);
		const text = await response.text();

		/**
		 * @todo
		 */
		return null;
	}
}