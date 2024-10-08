import {Geometry} from "./index.js";
import {Vector3} from "../math/index.js";

export class SSDPlaneGeometry extends Geometry {
	/**
	 * @param {[Vector3, Vector3, Vector3, Vector3]} anchors
	 */
	static fromAnchors(anchors) {
		const normal = SSDPlaneGeometry.getNormal(anchors[0], anchors[1], anchors[2]);
		const tangent = SSDPlaneGeometry.getTangent(anchors[0], anchors[1], anchors[2]);

		const vertices = new Float32Array(12);
		vertices.set(anchors[0], 0);
		vertices.set(anchors[1], 3);
		vertices.set(anchors[2], 6);
		vertices.set(anchors[3], 9);

		return new SSDPlaneGeometry({
			positions: vertices,
			positionIndices: Uint32Array.of(),
			normals: Float32Array.of(
				...normal,
				...normal,
				...normal,
				...normal,
			),
			normalIndices: Uint32Array.of(),
			tangents: Float32Array.of(
				...tangent,
				...tangent,
				...tangent,
				...tangent,
			),
			uvs: Float32Array.of(
				0, 1,
				0, 0,
				1, 0,
				1, 1,
			),
		});
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