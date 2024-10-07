import {OBJUnhandledFaceError} from "../../Error/OBJ/index.js";
import {Parser} from "../index.js";

/**
 * @typedef {Number[][]} UnparsedOBJData Same order as OBJ face indices (SoA)
 */

/**
 * @typedef {Object} OBJData
 * @property {Float32Array} vertices
 * @property {Uint32Array} indices
 * @property {Float32Array} normals
 */

/**
 * @typedef {(strings: String[], unparsedData: UnparsedOBJData) => void} KeywordHandlerCallback
 */

export class OBJParser extends Parser {
	static #LINE_EXPRESSION = /(\w*)(?: )*(.*)/;

	/**
	 * @type {Record.<String, KeywordHandlerCallback>}
	 */
	static #KEYWORDS_HANDLERS = {
		v(vertexComponentStrings, unparsedData) {
			for (let stringIndex = 0; stringIndex < vertexComponentStrings.length; stringIndex++) {
				const vertexComponentString = vertexComponentStrings[stringIndex];
				const vertexComponent = parseFloat(vertexComponentString);

				unparsedData[0].push(vertexComponent);
			}
		},
		vn(normalComponentStrings, unparsedData) {
			for (let stringIndex = 0; stringIndex < normalComponentStrings.length; stringIndex++) {
				const normalComponentString = normalComponentStrings[stringIndex];
				const normalComponent = parseFloat(normalComponentString);

				unparsedData[2].push(normalComponent);
			}
		},
		vt(uvComponentStrings, unparsedData) {
			for (let stringIndex = 0; stringIndex < uvComponentStrings.length; stringIndex++) {
				const uvComponentString = uvComponentStrings[stringIndex];
				const uvComponent = parseFloat(uvComponentString);

				unparsedData[1].push(uvComponent);
			}
		},
		f(faceVertexStrings, unparsedData) {
			if (faceVertexStrings.length < 3 || faceVertexStrings.length > 4) {
				throw new OBJUnhandledFaceError(faceVertexStrings.length);
			}

			/**
			 * Number of triangles in the face. This can either be:
			 * - 1 for a triangle (3 - 2)
			 * - 2 for a polygon (4 - 2)
			 */
			const triangleCount = faceVertexStrings.length - 2;

			for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
				// The provoking vertex is the same for every triangle the face is composed of
				// For polygon faces: 0 1 2 then 0 2 3
				OBJParser.#addVertex(faceVertexStrings[0], unparsedData);
				OBJParser.#addVertex(faceVertexStrings[1 + triangleIndex], unparsedData);
				OBJParser.#addVertex(faceVertexStrings[2 + triangleIndex], unparsedData);
			}
		},
	};

	/**
	 * @param {String} indexStringBlob
	 * @param {UnparsedOBJData} unparsedData
	 */
	static #addVertex(indexStringBlob, unparsedData) {
		const indexStrings = indexStringBlob.split("/");

		for (let indexStringIndex = 0; indexStringIndex < indexStrings.length; indexStringIndex++) {
			const indexString = indexStrings[indexStringIndex];

			if (!indexString) {
				// Encountered "//" case
				continue;
			}

			let index = parseInt(indexString);

			if (index < 0) {
				index = index + unparsedData[indexStringIndex].length * 3;
			}

			index = index - 1;

			unparsedData[indexStringIndex + 3].push(index);
		}
	}

	/**
	 * @param {String} text
	 */
	parse(text) {
		const lines = text.split("\n");

		const unparsedData = [
			[], // Position components
			[], // UV components
			[], // Normal components
			[], // Position indices
			[], // UV indices
			[], // Normal indices
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

			const exec = OBJParser.#LINE_EXPRESSION.exec(line);

			if (!exec) {
				continue;
			}

			const keyword = exec[1];

			if (!(keyword in OBJParser.#KEYWORDS_HANDLERS)) {
				console.warn(`OBJParser: Unhandled keyword "${keyword}" at line`, i + 1);

				continue;
			}

			const keywordHandler = OBJParser.#KEYWORDS_HANDLERS[keyword];
			const lineSplits = line.split(/\s+/).slice(1);

			keywordHandler(lineSplits, unparsedData);
		}

		/**
		 * @type {OBJData}
		 */
		const data = {};

		data.vertices = new Float32Array(unparsedData[0]);
		data.indices = new Uint32Array(unparsedData[3]);
		data.normals = new Float32Array(unparsedData[2]);

		return data;
	}
}