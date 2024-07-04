import {Mesh} from "../../public/hl2/Mesh.js";
import {Loader} from "./Loader.js";

export class SSDLoader extends Loader {
	/**
	 * @type {import("./ImageBitmapLoader.js").Image[]}
	 */
	#images;

	constructor() {
		super();

		this.#images = [];
	}

	/**
	 * @param {import("./ImageBitmapLoader.js").Image[]} images
	 */
	setImages(images) {
		this.#images = images;
	}

	/**
	 * Loads static scene description from a JSON file.
	 * 
	 * @param {String} path Scene file path
	 * @returns {Promise.<Mesh[]>}
	 * @throws {Error} if the request fails
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the scene file: request failed with status ${response.status}.`);
		}

		const imagePaths = this.#images.map(image => image.path);
		const extractedMeshes = [];
		const json = await response.json();
		const categories = Object.values(json);

		for (let i = 0, j; i < categories.length; i++) {
			const meshes = categories[i];

			for (j = 0; j < meshes.length; j++) {
				if (!("label" in meshes[j])) {
					continue;
				}

				extractedMeshes.push(Mesh.fromJson(meshes[j], this.#images, imagePaths));
			}
		}

		return extractedMeshes;
	}
}