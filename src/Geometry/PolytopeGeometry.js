import {Matrix4, Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

/**
 * @typedef {Object} PolytopeGeometryDescriptor
 * @property {Float32Array} vertices
 * @property {Uint8Array} indices
 */

export class PolytopeGeometry extends Geometry {
	/**
	 * @param {PolytopeGeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		super({
			vertices: descriptor.vertices,
			indices: descriptor.indices,
			normals: Float32Array.of(),
			tangents: Float32Array.of(),
			uvs: Float32Array.of(),
		});
	}

	/**
	 * Returns the point on the geometry
	 * that is the farthest in the direction of D.
	 * 
	 * @param {Vector3} D Direction vector (not copied, not normalized)
	 * @param {Matrix4} p Mesh projection matrix
	 * @returns {Vector3}
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