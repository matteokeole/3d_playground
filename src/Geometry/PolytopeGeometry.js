import {Vector3} from "../math/index.js";
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
	 * @returns {Vector3}
	 */
	support(D) {
		const vertices = this.getVertices();
		let maxDot = 0;
		let maxVertex;

		for (let i = 0; i < vertices.length; i += 3) {
			const vertex = new Vector3(...vertices.subarray(i, i + 3));
			const dot = vertex.dot(D);

			if (dot > maxDot) {
				maxDot = dot;
				maxVertex = vertex;
			}
		}

		return maxVertex;
	}
}