import {Parser} from "../index.js";

/**
 * @typedef {Object} OBJData
 * @property {Float32Array} vertices
 * @property {Int32Array} indices
 */

export class OBJParser extends Parser {
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
		f(parts, {indices, vertices}) {
			const triangleCount = parts.length - 2;
			const currentVertexCount = vertices.length / 3;

			for (let i = 0; i < triangleCount; i++) {
				OBJParser.#addVertex(parts[0], indices, currentVertexCount);
				OBJParser.#addVertex(parts[i + 1], indices, currentVertexCount);
				OBJParser.#addVertex(parts[i + 2], indices, currentVertexCount);
			}
		},
	};

	/**
	 * @param {String} vertexString
	 * @param {Number[]} indices
	 * @param {Number} vertexCount
	 */
	static #addVertex(vertexString, indices, vertexCount) {
		const vertexUvNormalString = vertexString.split("/");

		const indexString = vertexUvNormalString[0];
		let index = parseInt(indexString);

		if (index < 0) {
			index += vertexCount;
		}

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
	 * @param {String} text
	 */
	parse(text) {
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

			if (!(keyword in OBJParser.#KEYWORDS_HANDLERS)) {
				// console.warn(`Unhandled keyword "${keyword}" at line`, i + 1);

				continue;
			}

			const keywordHandler = OBJParser.#KEYWORDS_HANDLERS[keyword];
			const lineSplits = line.split(/\s+/).slice(1);

			keywordHandler(lineSplits, {vertices, indices, uvs, normals, vertexData, webglVertexData});
		}

		/**
		 * @type {OBJData}
		 */
		const data = {};

		data.vertices = new Float32Array(vertices);
		data.indices = new Int32Array(indices);

		return data;
	}
}