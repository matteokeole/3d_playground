import {Vector3} from "../math/index.js";
import {Loader} from "./Loader.js";

export class OBJLoader extends Loader {
	/**
	 * @type {Record.<String, *>}
	 */
	static #KEYWORDS = {
		v(vertexBuffer, vertex) {
			const vector = Vector3.from(vertex);

			vertexBuffer.push(vector[0], vector[1], vector[2]);
		},
	};

	/**
	 * Loads static scene description from a JSON file.
	 * 
	 * @param {String} path Scene file path
	 * @returns {Promise.<Object>}
	 * @throws {Error} The request failed
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the scene file: request failed with status ${response.status}.`);
		}

		const text = await response.text();
		const lines = text.split("\n");
		const lineExpression = /(\w*)(?= )*(.*)/;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (!line.length) {
				// Blank line
				continue;
			}

			if (line.startsWith("#")) {
				// Comment
				continue;
			}

			const exec = lineExpression.exec(line);

			if (!exec) {
				continue;
			}

			const [, keyword] = exec;

			if (!(keyword in OBJLoader.#KEYWORDS)) {
				console.warn("Unknown keyword:", keyword, "at line", i + 1);

				continue;
			}

			const keywordHandler = OBJLoader.#KEYWORDS[keyword];
			const unparsedArguments = line.split(/\s+/).slice(1);
			const buffer = [];

			keywordHandler(buffer, unparsedArguments);
		}
	}
}