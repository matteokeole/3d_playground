import {Vector2, Vector3} from "../math/index.js";

/**
 * @typedef {Object} GridGeometryDescriptor
 * @property {Vector2} size
 * @property {Number} step
 */

export class GridGeometry {
	#vertices;
	#indices;

	/**
	 * @param {GridGeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		const size = descriptor.size;
		const step = descriptor.step;

		const halfSize = new Vector2(size).divideScalar(2);
		const negatedHalfSize = new Vector2(halfSize).multiplyScalar(-1);
		const vertexCount = new Vector2(size).divideScalar(step).addScalar(1);
		const triangleCount = new Vector2(vertexCount[0] - 1, vertexCount[1] - 1).multiplyScalar(2);

		const vertices = new Float32Array(vertexCount[0] * vertexCount[1] * 3);
		const indices = new Uint8Array(triangleCount[0] * triangleCount[1] * 2);

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

		indices.set(indexArray);

		this.#vertices = vertices;
		this.#indices = indices;
	}

	getVertices() {
		return this.#vertices;
	}

	getIndices() {
		return this.#indices;
	}
}