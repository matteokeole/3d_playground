import {Vector3} from "../../math/index.js";
import {Parser} from "../index.js";

/**
 * @typedef {Object} OBJData
 * @property {Float32Array} vertices
 * @property {Uint32Array} indices
 * @property {Float32Array} normals
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
		vn(parts, {unsortedNormals}) {
			const normal = new Vector3(
				parseFloat(parts[0]),
				parseFloat(parts[1]),
				parseFloat(parts[2]),
			);

			unsortedNormals.push(...normal);
		},
		/* vt(parts, {uvs}) {
			const parsedParts = parts.map(parseFloat);

			uvs.push(parsedParts);
		}, */
		f(parts, {vertexIndices, unsortedNormals, normals, vertices}) {
			const triangleCount = parts.length - 2;
			const currentVertexCount = vertices.length / 3;

			for (let i = 0; i < triangleCount; i++) {
				OBJParser.#addVertex(parts[0], currentVertexCount, {vertexIndices, unsortedNormals, normals});
				OBJParser.#addVertex(parts[i + 1], currentVertexCount, {vertexIndices, unsortedNormals, normals});
				OBJParser.#addVertex(parts[i + 2], currentVertexCount, {vertexIndices, unsortedNormals, normals});
			}
		},
	};

	/**
	 * @param {String} face
	 * @param {Number} vertexCount
	 */
	static #addVertex(face, vertexCount, {vertexIndices, unsortedNormals, normals}) {
		const splittedFace = face.split("/");
		let vertexIndex = parseInt(splittedFace[0]);

		if (vertexIndex < 0) {
			vertexIndex += vertexCount;
		}

		vertexIndices.push(vertexIndex - 1);

		// let uvIndex;
		let normalIndex;

		if (splittedFace.length === 3) {
			normalIndex = parseInt(splittedFace[2]);

			if (normalIndex < 0) {
				normalIndex += vertexCount;
			}

			const normal = new Vector3(
				unsortedNormals[normalIndex * 3 + 0],
				// unsortedNormals[normalIndex * 3 + 1],
				// unsortedNormals[normalIndex * 3 + 2],
			);

			normals.push(unsortedNormals[normalIndex * 3 + 0]);
		}
	}

	/**
	 * @param {String} text
	 */
	parse(text) {
		const lines = text.split("\n");
		const lineExpression = /(\w*)(?: )*(.*)/;
		const vertices = [];
		const vertexIndices = [];
		const uvs = [
			[0, 0],
		];
		const unsortedNormals = [];
		const normals = [];
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

			keywordHandler(lineSplits, {vertices, vertexIndices, unsortedNormals, normals, uvs, vertexData, webglVertexData});
		}

		/**
		 * @type {OBJData}
		 */
		const data = {};

		data.vertices = new Float32Array(vertices);
		data.indices = new Uint32Array(vertexIndices);
		data.normals = new Float32Array(normals);

		return data;
	}
}