import {Loader} from "./Loader.js";

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
	 * @param {String} path JSON file path
	 * @returns {Promise.<Image[]>}
	 * @throws {Error} if the file request fails
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the file: request failed with status ${response.status}.`);
		}

		const json = await response.json();
		const basePath = path.substring(0, path.lastIndexOf("/") + 1);
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