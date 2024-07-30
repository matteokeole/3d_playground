import {Matrix4, Vector2, Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

/**
 * @typedef {Object} GridGeometryDescriptor
 * @property {Vector2} size
 * @property {Number} step
 */

export class GridGeometry extends Geometry {
	/**
	 * @param {GridGeometryDescriptor} descriptor
	 */
	static #calculateVerticesAndIndices(descriptor) {
		const size = descriptor.size;
		const step = descriptor.step;

		const halfSize = new Vector2(size).divideScalar(2);
		const negatedHalfSize = new Vector2(halfSize).multiplyScalar(-1);
		const vertexCount = new Vector2(size).divideScalar(step).addScalar(1);
		const vertices = new Float32Array(vertexCount[0] * vertexCount[1] * 3);

		for (let z = halfSize[1], i = 0; z >= negatedHalfSize[0]; z -= step, i++) {
			for (let x = negatedHalfSize[0], j = 0; x <= halfSize[0]; x += step, j++) {
				const vertex = new Vector3(x, 0, z);
				const offset = i * vertexCount[1] * 3 + j * 3;

				vertices.set(vertex, offset);
			}
		}

		const indexArray = [];

		for (let i = 0; i < vertexCount[1] - 1; i++) {
			for (let j = 0; j < vertexCount[0] - 1; j++) {
				const i0 = i * vertexCount[1] + j;
				const i1 = i0 + 1;
				const i2 = i0 + vertexCount[1];
				const i3 = i2 + 1;

				indexArray.push(i0, i1, i2);
				indexArray.push(i1, i3, i2);
			}
		}

		const indices = new Uint8Array(indexArray);

		return {
			vertices,
			indices,
		};
	}

	/**
	 * @param {GridGeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		super({
			...GridGeometry.#calculateVerticesAndIndices(descriptor),
			normals: Float32Array.of(),
			tangents: Float32Array.of(),
			uvs: Float32Array.of(),
		});
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