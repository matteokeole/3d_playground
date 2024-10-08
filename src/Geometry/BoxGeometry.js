import {Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

export class BoxGeometry extends Geometry {
	static #VERTEX_POSITIONS = Float32Array.of(
		 1, -1,  1,
		 1,  1,  1,
		-1,  1,  1,
		-1, -1,  1,
		-1, -1, -1,
		-1,  1, -1,
		 1,  1, -1,
		 1, -1, -1,
	);

	static #VERTEX_NORMALS = Float32Array.of(
		// Front
		 0,  0,  1,
		// Back
		 0,  0, -1,
		// Left
		-1,  0,  0,
		// Right
		 1,  0,  0,
		// Top
		 0,  1,  0,
		// Bottom
		 0, -1,  0,
	);

	static #VERTEX_POSITION_INDICES = Uint32Array.of(
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
	);

	static #VERTEX_NORMAL_INDICES = Uint32Array.of(
		// Front
		0, 0, 0,
		0, 0, 0,
		// Back
		1, 1, 1,
		1, 1, 1,
		// Left
		2, 2, 2,
		2, 2, 2,
		// Right
		3, 3, 3,
		3, 3, 3,
		// Top
		4, 4, 4,
		4, 4, 4,
		// Bottom
		5, 5, 5,
		5, 5, 5,
	);

	/**
	 * @param {Float32Array} vertices
	 */
	static getNormals(vertices) {
		const normals = new Float32Array(6 * 3);

		for (let i = 0; i < vertices.length; i += 12) {
			const a = new Vector3(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
			const b = new Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
			const c = new Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
			const normal = Geometry.getNormal(a, b, c);

			normals.set(normal, i / 4);
		}

		return normals;
	}

	/**
	 * @param {Float32Array} vertices
	 */
	static getTangents(vertices) {
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
	static getUVs(vertexCount) {
		const length = vertexCount / 12 * 8;
		const uvs = new Float32Array(length);
		const side = Float32Array.of(
			0, 1,
			0, 0,
			1, 0,
			1, 1,
		);

		for (let i = 0; i < length; i += 8) {
			uvs.set(side, i);
		}

		return uvs;
	}

	#size;

	/**
	 * @param {Vector3} size
	 */
	constructor(size) {
		super({
			positions: new Float32Array(BoxGeometry.#VERTEX_POSITIONS),
			positionIndices: new Uint32Array(BoxGeometry.#VERTEX_POSITION_INDICES),
			normals: new Float32Array(BoxGeometry.#VERTEX_NORMALS),
			normalIndices: new Uint32Array(BoxGeometry.#VERTEX_NORMAL_INDICES),
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
		 * @todo Store tangents and UVs
		 */
		// this.setTangents(BoxGeometry.getTangents(vertices));
		// this.setUvs(BoxGeometry.getUVs(vertices.length));
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