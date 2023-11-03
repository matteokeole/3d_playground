import {AbstractGeometry} from "../../src/geometries/index.js";
import {Vector2, Vector3} from "../../src/math/index.js";

export class SSDPlaneGeometry extends AbstractGeometry {
	static fromAnchors(anchors) {
		const [nx, ny, nz] = this.getNormal(anchors);
		const [tx, ty, tz] = this.getTangent(anchors);

		return new SSDPlaneGeometry({
			vertices: Float32Array.of(
				...anchors[0],
				...anchors[1],
				...anchors[2],
				...anchors[3],
			),
			normal: new Vector3(nx, ny, nz),
			normals: Float32Array.of(
				nx, ny, nz,
				nx, ny, nz,
				nx, ny, nz,
				nx, ny, nz,
			),
			tangent: new Vector3(tx, ty, tz),
			tangents: Float32Array.of(
				tx, ty, tz,
				tx, ty, tz,
				tx, ty, tz,
				tx, ty, tz,
			),
			uvs: Float32Array.of(
				0, 1,
				0, 0,
				1, 0,
				1, 1,
			),
		});
	}

	static getNormal(anchors) {
		const u = anchors[1].clone().subtract(anchors[0]);
		const v = anchors[2].clone().subtract(anchors[0]);

		return u.cross(v);
	}

	static getTangent(anchors) {
		const edge1 = anchors[1].clone().subtract(anchors[1]);
		const edge2 = anchors[2].clone().subtract(anchors[1]);
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
	 * @private
	 * @type {Vector3}
	 */
	#normal;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#tangent;

	/**
	 * @private
	 * @type {Float32Array}
	 */
	#tangents;

	constructor({vertices, normal, normals, tangent, tangents, uvs}) {
		super({
			indices: Uint8Array.of(),
			vertices,
			normals,
			uvs,
		});

		this.#normal = normal;
		this.#tangent = tangent;
		this.#tangents = tangents;
	}

	/** @returns {Vector3} */
	get normal() {
		return this.#normal;
	}

	/** @returns {Vector3} */
	get tangent() {
		return this.#tangent;
	}

	/** @returns {Float32Array} */
	get tangents() {
		return this.#tangents;
	}
}