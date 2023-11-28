import {Loader} from "./Loader.js";

/**
 * @typedef {Object} TextureDescriptor
 * @property {String} path
 * @property {HTMLImageElement} image
 */

export class TextureLoader extends Loader {
	/**
	 * Loads and returns images extracted from a source file.
	 * Note: The textures must be in the same directory as the source file.
	 * 
	 * @param {String} path Source file path
	 * @returns {Promise.<TextureDescriptor[]>}
	 * @throws {Error} if the request fails
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the source file: request failed with status ${response.status}.`);
		}

		const json = await response.json();
		const basePath = path.substring(0, path.lastIndexOf("/") + 1);
		const images = [];

		for (let i = 0, length = json.length, image; i < length; i++) {
			image = new Image();
			image.src = `${basePath}${json[i]}`;

			try {
				await image.decode();
			} catch {
				continue;
			}

			images.push({
				path: json[i],
				image,
			});
		}

		return images;
	}
}