import {Geometry} from "../../src/geometries/index.js";
import {Vector3} from "../../src/math/index.js";

export class SSDPlaneGeometry extends Geometry {
	/**
	 * @param {[Vector3, Vector3, Vector3, Vector3]} anchors
	 */
	static fromAnchors(anchors) {
		const normal = Geometry.getNormal(anchors[0], anchors[1], anchors[2]);
		const tangent = Geometry.getTangent(anchors[0], anchors[1], anchors[2]);
		const vertices = new Float32Array(12);

		vertices.set(anchors[0], 0);
		vertices.set(anchors[1], 3);
		vertices.set(anchors[2], 6);
		vertices.set(anchors[3], 9);

		return new SSDPlaneGeometry({
			indices: Uint8Array.of(),
			vertices,
			normals: Float32Array.of(
				...normal,
				...normal,
				...normal,
				...normal,
			),
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
}