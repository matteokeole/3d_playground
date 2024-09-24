import {Geometry, SSDPlaneGeometry} from "../Geometry/index.js";
import {Hull} from "../Hull/index.js";
import {Material, TextureMaterial} from "../Material/index.js";
import {Matrix3, Matrix4, max, PI, Vector2, Vector3} from "../math/index.js";

/**
 * @typedef {Object} MeshDescriptor
 * @property {Geometry} geometry
 * @property {Material} material
 * @property {Hull} [hull]
 * @property {String} [debugName]
 */

export class Mesh {
	/**
	 * @param {Object} json
	 * @param {import("../../src/Loader/ImageBitmapLoader.js").Image[]} images
	 * @param {String[]} imagePaths
	 */
	static fromSsd(json, images, imagePaths) {
		const anchors = json.anchors;
		const anchor1 = new Vector3(anchors[0], anchors[1], anchors[2]);
		const anchor2 = new Vector3(anchors[3], anchors[4], anchors[5]);
		const anchor3 = new Vector3(anchors[6], anchors[7], anchors[8]);
		const anchor4 = anchors.length === 12 ?
			new Vector3(anchors[9], anchors[10], anchors[11]) :
			new Vector3(anchor3).add(anchor1).subtract(anchor2);

		const textureIndex = imagePaths.indexOf(json.texture);

		if (textureIndex === -1) {
			throw new Error(`Tried to create SSD mesh with unloaded texture "${json.texture}".`);
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

		return new Mesh({
			geometry: SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			material: new TextureMaterial({
				textureMatrix: textureTransform,
				textureIndex,
				normalMapIndex: imagePaths.indexOf(json.normal_map),
			}),
		});
	}

	#geometryIndex;
	#geometry;
	#material;
	#world;
	#position;
	#rotation;
	#scale;
	#hull;
	#debugName;

	/**
	 * @param {MeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#geometryIndex = 0;
		this.#geometry = descriptor.geometry;
		this.#material = descriptor.material;
		this.#world = Matrix4.identity();
		this.#position = new Vector3(0, 0, 0);
		this.#rotation = new Vector3(0, 0, 0);
		this.#scale = new Vector3(1, 1, 1);
		this.#hull = descriptor.hull;
		this.#debugName = descriptor.debugName ?? null;
	}

	getGeometryIndex() {
		return this.#geometryIndex;
	}

	/**
	 * @param {Number} geometryIndex
	 */
	setGeometryIndex(geometryIndex) {
		this.#geometryIndex = geometryIndex;
	}

	getGeometry() {
		return this.#geometry;
	}

	getMaterial() {
		return this.#material;
	}

	getHull() {
		return this.#hull;
	}

	getWorld() {
		return this.#world;
	}

	updateWorld() {
		this.#world = Matrix4.translation(this.#position)
			.multiply(Matrix4.rotation(this.#rotation))
			.multiply(Matrix4.scale(this.#scale));

		if (!this.#hull) {
			return;
		}

		this.#hull.setWorld(this.#world);
	}

	getPosition() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	getRotation() {
		return this.#rotation;
	}

	/**
	 * @param {Vector3} rotation
	 */
	setRotation(rotation) {
		this.#rotation = rotation;
	}

	getScale() {
		return this.#scale;
	}

	/**
	 * @param {Vector3} scale
	 */
	setScale(scale) {
		this.#scale = scale;
	}

	getDebugName() {
		return this.#debugName;
	}
}