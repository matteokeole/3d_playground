import {Matrix4, Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

export class BoxGeometry extends Geometry {
	#size;

	/**
	 * @param {Vector3} size
	 */
	constructor(size) {
		super({
			indices: Uint32Array.of(
				// Front
				0, 1, 2,
				0, 2, 3,
				// Back
				4, 5, 6,
				4, 6, 7,
				// Left
				3, 2, 5,
				3, 5, 4,
				// Right
				7, 6, 1,
				7, 1, 0,
				// Top
				5, 2, 1,
				5, 1, 6,
				// Bottom
				3, 4, 7,
				3, 7, 0,
			),
			vertices: Float32Array.of(
				1, -1,  1,
				1,  1,  1,
			   -1,  1,  1,
			   -1, -1,  1,
			   -1, -1, -1,
			   -1,  1, -1,
				1,  1, -1,
				1, -1, -1,
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

	/**
	 * @type {Geometry["support"]}
	 */
	support(D, p) {
		const vertices = this.getVertices();
		const support = new Vector3(0, 0, 0);
		let maxDot = Number.NEGATIVE_INFINITY;

		for (let i = 0; i < vertices.length; i += 3) {
			const vertex = new Vector3(...vertices.subarray(i, i + 3)).multiplyMatrix(p);
			const dot = vertex.dot(D);

			if (dot > maxDot) {
				maxDot = dot;
				support.set(vertex);
			}
		}

		return support;
	}
}