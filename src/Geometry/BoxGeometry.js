import {Geometry} from "./Geometry.js";
import {Vector3} from "../math/index.js";

/**
 * @extends {Geometry}
 */
export class BoxGeometry extends Geometry {
	/**
	 * @type {Float32Array}
	 */
	static NON_INDEXED_VERTICES = Float32Array.of(
		// Front
		-.5, -.5, -.5,
		-.5, .5, -.5,
		.5, .5, -.5,
		-.5, -.5, -.5,
		.5, .5, -.5,
		.5, -.5, -.5,
		// Back
		.5, -.5, .5,
		.5, .5, .5,
		-.5, .5, .5,
		.5, -.5, .5,
		-.5, .5, .5,
		-.5, -.5, .5,
		// Left
		-.5, -.5, .5,
		-.5, .5, .5,
		-.5, .5, -.5,
		-.5, -.5, .5,
		-.5, .5, -.5,
		-.5, -.5, -.5,
		// Right
		.5, -.5, -.5,
		.5, .5, -.5,
		.5, .5, .5,
		.5, -.5, -.5,
		.5, .5, .5,
		.5, -.5, .5,
		// Top
		-.5, .5, -.5,
		-.5, .5, .5,
		.5, .5, .5,
		-.5, .5, -.5,
		.5, .5, .5,
		.5, .5, -.5,
		// Bottom
		-.5, -.5, .5,
		-.5, -.5, -.5,
		.5, -.5, -.5,
		-.5, -.5, .5,
		.5, -.5, -.5,
		.5, -.5, .5,
	);

	#size;

	/**
	 * @param {Vector3} size
	 */
	constructor(size) {
		super({
			indices: Uint8Array.of(
				// Front
				0,  1,  2,
				0,  2,  3,
				// Back
				4,  5,  6,
				4,  6,  7,
				// Left
				8,  9,  10,
				8,  10, 11,
				// Right
				12, 13, 14,
				12, 14, 15,
				// Top
				16, 17, 18,
				16, 18, 19,
				// Bottom
				20, 21, 22,
				20, 22, 23,
			),
			vertices: Float32Array.of(
				// Front
				1, -1,  1,
				1,  1,  1,
			   -1,  1,  1,
			   -1, -1,  1,
				// Back
			   -1, -1, -1,
			   -1,  1, -1,
				1,  1, -1,
				1, -1, -1,
				// Left
			   -1, -1,  1,
			   -1,  1,  1,
			   -1,  1, -1,
			   -1, -1, -1,
				// Right
				1, -1, -1,
				1,  1, -1,
				1,  1,  1,
				1, -1,  1,
				// Top
			   -1,  1, -1,
			   -1,  1,  1,
				1,  1,  1,
				1,  1, -1,
				// Bottom
			   -1, -1,  1,
			   -1, -1, -1,
				1, -1, -1,
				1, -1,  1,
			),
			normals: Float32Array.of(),
			tangents: Float32Array.of(),
			uvs: Float32Array.of(),
		});

		this.#size = size;

		const halfSize = new Vector3(this.#size).divideScalar(2);

		for (let i = 0, length = this._vertices.length; i < length; i += 3) {
			this._vertices[i + 0] *= halfSize[0];
			this._vertices[i + 1] *= halfSize[1];
			this._vertices[i + 2] *= halfSize[2];
		}

		this._normals = Geometry.getNormals(this._vertices);
		this._tangents = Geometry.getTangents(this._vertices);
		this._uvs = Geometry.getUVs(this._vertices.length);
	}

	getSize() {
		return this.#size;
	}
}