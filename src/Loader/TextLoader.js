import {Loader} from "./Loader.js";
import {FileLoader} from "./index.js";

export class TextLoader extends Loader {
	/**
	 * @param {String} url
	 */
	async load(url) {
		const fileLoader = new FileLoader();
		const response = await fileLoader.load(url);
		const text = await response.text();

		return text;
	}
}