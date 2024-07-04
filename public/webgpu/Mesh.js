import {Mesh as _Mesh} from "../../src/index.js";
import {Material} from "../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../src/math/index.js";
import {SSDPlaneGeometry} from "../hl2/SSDPlaneGeometry.js";

export class Mesh extends _Mesh {
	/**
	 * @param {Object} json
	 * @param {import("../../src/Loader/ImageBitmapLoader.js").Image[]} images
	 * @param {String[]} imagePaths
	 */
	static fromJson(json, images, imagePaths) {
		const anchors = json.anchors;
		const anchor1 = new Vector3(anchors[0], anchors[1], anchors[2]);
		const anchor2 = new Vector3(anchors[3], anchors[4], anchors[5]);
		const anchor3 = new Vector3(anchors[6], anchors[7], anchors[8]);
		const anchor4 = anchors.length === 9 ?
			new Vector3(anchor3).add(anchor1).subtract(anchor2) :
			new Vector3(anchors[9], anchors[10], anchors[11]);
		const w = anchor1.to(anchor2);
		const h = anchor2.to(anchor3);

		const textureIndex = imagePaths.indexOf(json.texture);
		const bitmap = images[textureIndex].bitmap;

		const textureTranslation = new Vector2();
		textureTranslation.set(json.uv);

		const textureRotation = json.uv_rotation * PI;

		const textureScale = new Vector2(h, w)
			.divide(new Vector2(bitmap.width, bitmap.height))
			.divide(new Vector2(json.uv_scale[0], json.uv_scale[1]));

		const textureMatrix = Matrix3
			.translation(textureTranslation)
			.multiply(Matrix3.rotation(textureRotation))
			.multiply(Matrix3.scale(textureScale));

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			new Material({
				textureMatrix,
				textureIndex,
				normalMapIndex: imagePaths.indexOf(json.normal_map),
			}),
		);
	}
}