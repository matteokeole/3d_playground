import {Vector2, Vector3} from "../math/index.js";

/**
 * @typedef {Object} GeometryDescriptor
 * @property {Float32Array} vertices
 * @property {Uint8Array} indices
 * @property {Float32Array} normals
 * @property {Float32Array} tangents
 * @property {Float32Array} uvs
 */

/**
 * @abstract
 */
export class Geometry {
	/**
	 * @param {Float32Array} vertices
	 */
	static getNormals(vertices) {
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
	 * @param {Vector3} anchor1
	 * @param {Vector3} anchor2
	 * @param {Vector3} anchor3
	 */
	static getNormal(anchor1, anchor2, anchor3) {
		const u = new Vector3(anchor2).subtract(anchor1);
		const v = new Vector3(anchor3).subtract(anchor1);

		return u.cross(v).normalize();
	}

	/**
	 * @param {Vector3} anchor1
	 * @param {Vector3} anchor2
	 * @param {Vector3} anchor3
	 */
	static getTangent(anchor1, anchor2, anchor3) {
		const edge1 = new Vector3(anchor2).subtract(anchor1);
		const edge2 = new Vector3(anchor3).subtract(anchor1);
		const deltaUV1 = new Vector2(0, 0).subtract(new Vector2(0, 1));
		const deltaUV2 = new Vector2(1, 0).subtract(new Vector2(0, 1));
		const f = 1 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

		return new Vector3(
			(deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]),
			(deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]),
			(deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]),
		).multiplyScalar(f);
	}

	/**
	 * @param {Number} vertexCount
	 */
	static getUVs(vertexCount) {
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

	_vertices;
	_indices;
	_normals;
	_tangents;
	_uvs;

	/**
	 * @param {GeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		this._vertices = descriptor.vertices;
		this._indices = descriptor.indices;
		this._normals = descriptor.normals;
		this._tangents = descriptor.tangents;
		this._uvs = descriptor.uvs;
	}

	getVertices() {
		return this._vertices;
	}

	getIndices() {
		return this._indices;
	}

	getNormals() {
		return this._normals;
	}

	getTangents() {
		return this._tangents;
	}

	getUVs() {
		return this._uvs;
	}

	/**
	 * Returns the point on the geometry
	 * that is the farthest in the direction of D.
	 * 
	 * @abstract
	 * @param {Vector3} D Direction vector
	 * @returns {Vector3}
	 */
	support(D) {
		throw new Error("Not implemented");
	}
}