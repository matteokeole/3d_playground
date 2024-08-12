import {Loader} from "./Loader.js";

/**
 * @typedef {Object} OBJ
 * @property {Float32Array} vertices
 * @property {Uint32Array} indices
 */

export class OBJLoader extends Loader {
	/**
	 * @type {Record.<String, *>}
	 */
	static #KEYWORDS_HANDLERS = {
		v(lineSplits, {vertices}) {
			for (let i = 0; i < lineSplits.length; i++) {
				const lineSplit = lineSplits[i];
				const float = parseFloat(lineSplit);

				vertices.push(float);
			}
		},
		/* vn(parts, {normals}) {
			const parsedParts = parts.map(parseFloat);

			normals.push(parsedParts);
		}, */
		/* vt(parts, {uvs}) {
			const parsedParts = parts.map(parseFloat);

			uvs.push(parsedParts);
		}, */
		f(parts, {indices}) {
			const triangleCount = parts.length - 2;

			for (let i = 0; i < triangleCount; i++) {
				OBJLoader.#addVertex(parts[0], indices);
				OBJLoader.#addVertex(parts[i + 1], indices);
				OBJLoader.#addVertex(parts[i + 2], indices);
			}
		},
	};

	/**
	 * @param {String} vertexString
	 */
	static #addVertex(vertexString, indices, vertexData, webglVertexData) {
		const vertexUvNormalString = vertexString.split("/");

		const indexString = vertexUvNormalString[0];
		const index = parseInt(indexString) - 1;

		indices.push(index);

		/* for (let i = 0; i < vertexUvNormalString.length; i++) {
			const objectIndexString = vertexUvNormalString[i];

			if (!objectIndexString) {
				return;
			}

			const objectIndex = parseInt(objectIndexString);
			let index = objectIndex;

			if (objectIndex < 0) {
				index += vertexData[i].length;
			}

			webglVertexData[i].push(...vertexData[i][index]);
		} */
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);

		const text = await response.text();
		const lines = text.split("\n");
		const lineExpression = /(\w*)(?: )*(.*)/;
		const vertices = [];
		const indices = [];
		const uvs = [
			[0, 0],
		];
		const normals = [
			[0, 0, 0],
		];
		const vertexData = [
			vertices,
			uvs,
			normals,
		];
		const webglVertexData = [
			[], // Positions
			[], // UVs
			[], // Normals
		];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

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

			const keyword = exec[1];

			if (!(keyword in OBJLoader.#KEYWORDS_HANDLERS)) {
				// console.warn(`Unhandled keyword "${keyword}" at line`, i + 1);

				continue;
			}

			const keywordHandler = OBJLoader.#KEYWORDS_HANDLERS[keyword];
			const lineSplits = line.split(/\s+/).slice(1);

			keywordHandler(lineSplits, {vertices, indices, uvs, normals, vertexData, webglVertexData});
		}

		const vertexBuffer = new Float32Array(vertices);
		const indexBuffer = new Uint32Array(indices);

		/**
		 * @type {OBJ}
		 */
		const obj = {
			vertices: vertexBuffer,
			indices: indexBuffer,
		};

		return obj;
	}
}