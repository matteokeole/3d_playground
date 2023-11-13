import {Geometry} from "../../src/geometries/index.js";
import {Vector3} from "../../src/math/index.js";

export class SSDPlaneGeometry extends Geometry {
	/**
	 * @param {[Vector3, Vector3, Vector3, Vector3]} anchors
	 */
	static fromAnchors(anchors) {
		const normal = Geometry.getNormal(anchors[0], anchors[1], anchors[2]);
		const tangent = Geometry.getTangent(anchors[0], anchors[1], anchors[2]);

		return new SSDPlaneGeometry({
			indices: Uint8Array.of(),
			vertices: Float32Array.of(
				...anchors[0],
				...anchors[1],
				...anchors[2],
				...anchors[3],
			),
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

	/**
	 * @param {import("../../src/geometries/Geometry.js").GeometryDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);
	}
}