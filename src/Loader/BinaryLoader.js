import {Loader} from "./Loader.js";
import {FileLoader} from "./index.js";

export class BinaryLoader extends Loader {
	/**
	 * @param {String} url
	 * @returns {Promise.<ArrayBuffer>}
	 * @throws {Error} if the request fails
	 */
	async load(url) {
		const fileLoader = new FileLoader();
		const response = await fileLoader.load(url);
		const arrayBuffer = await response.arrayBuffer();

		return arrayBuffer;
	}
}