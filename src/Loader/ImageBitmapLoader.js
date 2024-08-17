import {Loader} from "./Loader.js";
import {FileLoader} from "./index.js";

/**
 * @typedef {Object} Image
 * @property {String} path
 * @property {ImageBitmap} bitmap
 */

export class ImageBitmapLoader extends Loader {
	/**
	 * Loads and returns images listed in a JSON file.
	 * Note: The textures must be in the same directory as the file.
	 * 
	 * @param {String} url
	 * @returns {Promise.<Image[]>}
	 * @throws {Error} if the file request fails
	 */
	async load(url) {
		const fileLoader = new FileLoader();
		const response = await fileLoader.load(url);
		const json = await response.json();
		const basePath = url.substring(0, url.lastIndexOf("/") + 1);
		const images = [];

		for (let i = 0, length = json.length; i < length; i++) {
			const response = await fetch(`${basePath}${json[i]}`);
			const blob = await response.blob();
			const bitmap = await createImageBitmap(blob);

			images.push({
				path: json[i],
				bitmap,
			});
		}

		return images;
	}
}