import {Loader} from "./Loader.js";

export class ShaderLoader extends Loader {
	/**
	 * Loads and returns shader code from a source file.
	 * 
	 * @param {String} path Shader file path
	 * @returns {Promise.<String>}
	 * @throws {Error} if the request fails
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the shader file: request failed with status ${response.status}.`);
		}

		return await response.text();
	}
}