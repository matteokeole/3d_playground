import {Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

export class BoxGeometry extends Geometry {
	/**
	 * @param {Float32Array} vertices
	 */
	static #getNormals(vertices) {
		const normals = new Float32Array(vertices.length);
		let anchor1, anchor2, anchor3, normal;

		for (let i = 0, l = vertices.length; i < l; i += 12) {
			anchor1 = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
			anchor2 = new Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
			anchor3 = new Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
			normal = Geometry.getNormal(anchor1, anchor2, anchor3);

			normals.set(normal, i);
			normals.set(normal, i + 3);
			normals.set(normal, i + 6);
			normals.set(normal, i + 9);
		}

		return normals;
	}

	/**
	 * @param {Float32Array} vertices
	 */
	static #getTangents(vertices) {
		const tangents = new Float32Array(vertices.length);
		let anchor1, anchor2, anchor3, tangent;

		for (let i = 0, l = vertices.length; i < l; i += 12) {
			anchor1 = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
			anchor2 = new Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
			anchor3 = new Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
			tangent = Geometry.getTangent(anchor1, anchor2, anchor3);

			tangents.set(tangent, i);
			tangents.set(tangent, i + 3);
			tangents.set(tangent, i + 6);
			tangents.set(tangent, i + 9);
		}

		return tangents;
	}

	/**
	 * @param {Number} vertexCount
	 */
	static #getUVs(vertexCount) {
		const length = vertexCount / 12 * 8;
		const uv = new Float32Array(length);
		const side = Float32Array.of(
			0, 1,
			0, 0,
			1, 0,
			1, 1,
		);

		for (let i = 0; i < length; i += 8) uv.set(side, i);

		return uv;
	}

	#size;

	/**
	 * @param {Vector3} size
	 */
	constructor(size) {
		super({
			positions: Float32Array.of(
				1, -1,  1,
				1,  1,  1,
			   -1,  1,  1,
			   -1, -1,  1,
			   -1, -1, -1,
			   -1,  1, -1,
				1,  1, -1,
				1, -1, -1,
			),
			positionIndices: Uint32Array.of(
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
			normals: Float32Array.of(),
			normalIndices: Uint32Array.of(),
		});

		this.#size = size;

		const halfSize = new Vector3(this.#size).divideScalar(2);
		const vertices = this.getPositions();

		for (let i = 0; i < vertices.length; i += 3) {
			vertices[i + 0] *= halfSize[0];
			vertices[i + 1] *= halfSize[1];
			vertices[i + 2] *= halfSize[2];
		}

		/**
		 * @todo Fix normal indexing
		 */
		this._normals = BoxGeometry.#getNormals(vertices);
		this._tangents = BoxGeometry.#getTangents(vertices);
		this._uvs = BoxGeometry.#getUVs(vertices.length);
	}

	getSize() {
		return this.#size;
	}

	/**
	 * @type {Geometry["support"]}
	 */
	support(D, p) {
		const vertices = this.getPositions();
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