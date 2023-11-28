import {Mesh as _Mesh} from "../../src/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../src/math/index.js";
import {Hitbox} from "./Hitbox.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Mesh extends _Mesh {
	/**
	 * @type {?Hitbox}
	 */
	#hitbox;

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
			anchor3.clone().add(anchor1).subtract(anchor2) :
			new Vector3(anchors[9], anchors[10], anchors[11]);

		const textureIndex = imagePaths.indexOf(json.texture);
		const bitmap = images[textureIndex].bitmap;

		const w = anchor1.to(anchor2);
		const h = anchor2.to(anchor3);

		const uvScale = new Vector2();
		uvScale.set(json.uv_scale);

		const translation = new Vector2();
		translation.set(json.uv);
		const rotation = json.uv_rotation * PI;
		const scale = new Vector2(h, w)
			.divide(image.getViewport())
			.divide(uvScale);

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			new Material({
				textureMatrix: Matrix3
					.translation(translation)
					.multiply(Matrix3.rotation(rotation))
					.multiply(Matrix3.scale(scale)),
				textureIndex,
				normalMapIndex: imagePaths.indexOf(json.normal_map),
			}),
		);
	}

	getHitbox() {
		return this.#hitbox;
	}

	buildHitbox() {
		if (!(this._geometry instanceof BoxGeometry)) {
			throw Error("Can't initialize the hitbox of a non-3D mesh.");
		}

		this.#hitbox = new Hitbox({
			position: this._position,
			size: this._geometry.getSize(),
		});
	}
}