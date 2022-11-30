import {TEXTURE_PATH, IMAGES} from "../../public/constants.js";

/**
 * Asynchronous image loader function.
 * 
 * @async
 * @param {array} paths
 */
export async function loadImages(paths) {
	const {length} = paths;
	let path, image;

	for (let i = 0; i < length; i++) {
		path = paths[i];
		image = new Image();
		image.src = `${TEXTURE_PATH}${path}`;

		try {
			await image.decode();
		} catch (error) {
			continue;
		}

		IMAGES[path] = image;
	}
}