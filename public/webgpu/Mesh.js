import {Mesh as _Mesh} from "../../src/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../src/math/index.js";
import {SSDPlaneGeometry} from "../hl2/SSDPlaneGeometry.js";
import {TextureMaterial} from "./TextureMaterial.js";

export class Mesh extends _Mesh {
	/**
	 * @param {Object} json
	 * @param {Number} textureIndex
	 * @param {Number} normalMapIndex
	 */
	static fromJson(json, textureIndex, normalMapIndex) {
		const anchors = json.anchors;
		const anchor1 = new Vector3(anchors[0], anchors[1], anchors[2]);
		const anchor2 = new Vector3(anchors[3], anchors[4], anchors[5]);
		const anchor3 = new Vector3(anchors[6], anchors[7], anchors[8]);
		const anchor4 = anchors.length === 9 ?
			anchor3.clone().add(anchor1).subtract(anchor2) :
			new Vector3(anchors[9], anchors[10], anchors[11]);
		const w = anchor1.to(anchor2);
		const h = anchor2.to(anchor3);

		const textureMatrix = Matrix3
			.identity()
			.multiply(Matrix3.translation(new Vector2(json.uv[0], json.uv[1])))
			.multiply(Matrix3.rotation(json.uv_rotation * PI))
			.multiply(Matrix3.scale(
				new Vector2(h, w)
					.divide(new Vector2(512, 512))
					.divide(new Vector2(json.uv_scale[0], json.uv_scale[1])),
			));

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			new TextureMaterial({
				textureMatrix,
				textureIndex,
				normalMapIndex,
			}),
		);
	}
}