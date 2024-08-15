import {Loader} from "./Loader.js";
import {FileLoader} from "./index.js";

export class ShaderLoader extends Loader {
	/**
	 * Loads and returns shader code from a source file.
	 * 
	 * @param {String} url
	 * @returns {Promise.<String>}
	 * @throws {Error} if the request fails
	 */
	async load(url) {
		const fileLoader = new FileLoader();
		const response = await fileLoader.load(url);
		const text = await response.text();

		return text;
	}
}