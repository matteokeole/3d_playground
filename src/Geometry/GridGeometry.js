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
		const [columnCount, rowCount] = descriptor.size;
		const w = columnCount + 1;
		const h = rowCount + 1;
		const step = descriptor.step;
		const vertexBufferLength = w * h * 3;
		const vertexBuffer = new Float32Array(vertexBufferLength);
		const indexBufferLength = columnCount * rowCount * 6;
		const indexBuffer = new Uint32Array(indexBufferLength);

		for (let rowIndex = 0, z = step * (rowCount / 2); rowIndex < h; rowIndex++, z -= step) {
			for (let columnIndex = 0, x = -step * (columnCount / 2); columnIndex < w; columnIndex++, x += step) {
				const i = ((rowIndex * h) + columnIndex) * 3;

				vertexBuffer[i + 0] = x;
				vertexBuffer[i + 1] = 0;
				vertexBuffer[i + 2] = z;
			}
		}

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				const i = ((rowIndex * columnCount) + columnIndex) * 6;
				const i0 = (rowIndex * w) + columnIndex;
				const i1 = i0 + 1;
				const i2 = i0 + w;
				const i3 = i2 + 1;

				indexBuffer[i + 0] = i0;
				indexBuffer[i + 1] = i1;
				indexBuffer[i + 2] = i2;
				indexBuffer[i + 3] = i1;
				indexBuffer[i + 4] = i3;
				indexBuffer[i + 5] = i2;
			}
		}

		return {
			vertices: vertexBuffer,
			indices: indexBuffer,
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