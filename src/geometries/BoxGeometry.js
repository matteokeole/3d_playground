import {Geometry} from "./Geometry.js";
import {Vector3} from "../math/index.js";

export class BoxGeometry extends Geometry {
	/**
	 * @type {Vector3}
	 */
	#size;

	/**
	 * @param {Vector3} size
	 */
	constructor(size) {
		super({
			indices: Uint8Array.of(
				0,  2,  1,		2,  3,  1,
				8,  10, 9,		10, 11, 9,
				12, 14, 13,		14, 15, 13,
				4,  6,  5,		6,  7,  5,
				16, 18, 17,		18, 19, 17,
				20, 22, 21,		22, 23, 21,
			),
			vertices: Float32Array.of(
			   -1,  1,  1,		1,  1,  1,	   -1, -1,  1,		1, -1,  1,		// Front
				1,  1, -1,	   -1,  1, -1,		1, -1, -1,	   -1, -1, -1,		// Back
			   -1,  1, -1,	   -1,  1,  1,	   -1, -1, -1,	   -1, -1,  1,		// Left
				1,  1,  1,		1,  1, -1,		1, -1,  1,		1, -1, -1,		// Right
			   -1,  1, -1,		1,  1, -1,	   -1,  1,  1,		1,  1,  1,		// Top
				1, -1, -1,	   -1, -1, -1,		1, -1,  1,	   -1, -1,  1,		// Bottom
			),
			normals: Float32Array.of(
				0,  0,  1,		0,  0,  1,		0,  0,  1,		0,  0,  1,
				0,  0, -1,		0,  0, -1,		0,  0, -1,		0,  0, -1,
			   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,
				1,  0,  0,		1,  0,  0,		1,  0,  0,		1,  0,  0,
				0,  1,  0,		0,  1,  0,		0,  1,  0,		0,  1,  0,
				0, -1,  0,		0, -1,  0,		0, -1,  0,		0, -1,  0,
			),
			uvs: Float32Array.of(
				1, 1,	0, 1,	1, 0,	0, 0,
				1, 1,	0, 1,	1, 0,	0, 0,
				1, 1,	0, 1,	1, 0,	0, 0,
				1, 1,	0, 1,	1, 0,	0, 0,
				1, 1,	0, 1,	1, 0,	0, 0,
				1, 1,	0, 1,	1, 0,	0, 0,
			),
		});

		this.#size = size;

		const halfSize = this.#size
			.clone()
			.divideScalar(2);

		for (let i = 0, length = this.getVertices().length; i < length; i += 3) {
			this.getVertices()[i + 0] *= halfSize[0];
			this.getVertices()[i + 1] *= halfSize[1];
			this.getVertices()[i + 2] *= halfSize[2];
		}
	}

	getSize() {
		return this.#size;
	}
}