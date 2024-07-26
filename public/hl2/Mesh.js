import {AABB, Hitbox} from "../../src/index.js";
import {BoxGeometry, Geometry} from "../../src/Geometry/index.js";
import {Material} from "../../src/Material/index.js";
import {Matrix3, max, PI, Vector2, Vector3} from "../../src/math/index.js";
import {Mesh as _Mesh} from "../../src/Mesh/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Mesh extends _Mesh {
	/**
	 * @type {?Hitbox}
	 */
	#hitbox;

	/**
	 * @type {Boolean}
	 */
	#isTiedToCamera;

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
		const anchor4 = anchors.length === 12 ?
			new Vector3(anchors[9], anchors[10], anchors[11]) :
			new Vector3(anchor3).add(anchor1).subtract(anchor2);

		const textureIndex = imagePaths.indexOf(json.texture);

		if (textureIndex === -1) {
			throw new Error("Texture not found");
		}

		const bitmap = images[textureIndex].bitmap;

		const textureWidth = max(anchor1.to(anchor4), anchor2.to(anchor3));
		const textureHeight = max(anchor1.to(anchor2), anchor4.to(anchor3));

		const uvScale = new Vector2();
		uvScale.set(json.uv_scale);

		const translation = new Vector2();
		translation.set(json.uv);
		const rotation = json.uv_rotation * PI;
		const scale = new Vector2(textureWidth, textureHeight)
			.divide(new Vector2(bitmap.width, bitmap.height))
			.divide(uvScale);

		const textureTransform = Matrix3
			.identity()
			.multiply(Matrix3.translation(translation))
			.multiply(Matrix3.rotation(rotation))
			.multiply(Matrix3.scale(scale));

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			new Material({
				textureMatrix: textureTransform,
				textureIndex,
				normalMapIndex: imagePaths.indexOf(json.normal_map),
			}),
		);
	}

	/**
	 * @param {Geometry} geometry
	 * @param {Material} material
	 * @param {?String} [debugName]
	 */
	constructor(geometry, material, debugName) {
		super(geometry, material, debugName);

		this.#isTiedToCamera = false;
	}

	getHitbox() {
		return this.#hitbox;
	}

	isTiedToCamera() {
		return this.#isTiedToCamera;
	}

	/**
	 * @param {Boolean} isTiedToCamera
	 */
	setIsTiedToCamera(isTiedToCamera) {
		this.#isTiedToCamera = isTiedToCamera;
	}

	buildHitbox() {
		let size;

		if (!(this._geometry instanceof BoxGeometry)) {
			size = new Vector3(1, 1, 1);

			console.warn("Non-3D mesh hitbox generation is experimental.");
		} else {
			size = this._geometry.getSize();
		}

		const aabb = new AABB(this.getPosition(), size);

		this.#hitbox = new Hitbox(aabb);
	}
}