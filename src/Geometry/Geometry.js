import {Matrix4, Vector2, Vector3} from "../math/index.js";

/**
 * @typedef {Object} GeometryDescriptor
 * @property {Float32Array} positions
 * @property {Uint32Array} positionIndices
 * @property {Float32Array} normals
 * @property {Uint32Array} normalIndices
 * @property {Float32Array} [tangents]
 * @property {Float32Array} [uvs]
 */

export class Geometry {
	/**
	 * Creates a normal using 3 vertices from a face.
	 * 
	 * @param {Vector3} a
	 * @param {Vector3} b
	 * @param {Vector3} c
	 */
	static getNormal(a, b, c) {
		const ab = new Vector3(b).subtract(a);
		const ac = new Vector3(c).subtract(a);

		return ab.cross(ac).normalize();
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
	 * Vertex position components
	 */
	#positions;

	/**
	 * Vertex position indices
	 */
	#positionIndices;

	/**
	 * Vertex normal components
	 */
	#normals;

	/**
	 * Vertex normal indices
	 */
	#normalIndices;

	/**
	 * Vertex tangent components
	 */
	#tangents;

	/**
	 * Vertex texture coordinate components
	 */
	#uvs;

	/**
	 * @param {GeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#positions = descriptor.positions;
		this.#positionIndices = descriptor.positionIndices;
		this.#normals = descriptor.normals;
		this.#normalIndices = descriptor.normalIndices;

		this.#tangents = descriptor.tangents ?? Float32Array.of();
		this.#uvs = descriptor.uvs ?? Float32Array.of();
	}

	getPositions() {
		return this.#positions;
	}

	getPositionIndices() {
		return this.#positionIndices;
	}

	getNormals() {
		return this.#normals;
	}

	getNormalIndices() {
		return this.#normalIndices;
	}

	getTangents() {
		return this.#tangents;
	}

	getUVs() {
		return this.#uvs;
	}

	getTriangleCount() {
		return this.#positionIndices.length / 3;
	}

	/**
	 * Returns the point on the geometry
	 * that is the farthest in the direction of D.
	 * 
	 * @abstract
	 * @param {Vector3} D Direction vector
	 * @param {Matrix4} p Mesh projection matrix
	 * @returns {Vector3}
	 */
	support(D, p) {
		throw new Error("Not implemented");
	}
}