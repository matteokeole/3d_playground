import {Matrix4, Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

/**
 * @typedef {Object} PolytopeGeometryDescriptor
 * @property {Float32Array} vertices
 * @property {Uint32Array} indices
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