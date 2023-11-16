import {Geometry} from "../../src/geometries/index.js";
import {Mesh as _Mesh} from "../../src/index.js";

export class Mesh extends _Mesh {
	/**
	 * @param {Object} json
	 * @returns {Mesh}
	 * @throws {Error} if the geometry is invalid
	 */
	static fromJson(json) {
		return new Mesh(
			new Geometry({
				indices: Uint8Array.of(),
				vertices: Float32Array.from(json.anchors),
				normals: Float32Array.of(),
				tangents: Float32Array.of(),
				uvs: Float32Array.of(),
			}),
			null,
		);
	}
}