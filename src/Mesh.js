import {Geometry} from "./Geometry/index.js";
import {Matrix4, Vector3} from "./math/index.js";
import {Material} from "./Material/index.js";

/**
 * @abstract
 */
export class Mesh {
	/**
	 * @type {Geometry}
	 */
	_geometry;

	/**
	 * @type {Material}
	 */
	_material;

	/**
	 * @type {Matrix4}
	 */
	#projection;

	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	#rotation;

	/**
	 * @type {Vector3}
	 */
	#scale;

	/**
	 * @type {?String}
	 */
	#debugName;

	/**
	 * @param {Geometry} geometry
	 * @param {Material} material
	 * @param {?String} [debugName]
	 */
	constructor(geometry, material, debugName) {
		this._geometry = geometry;
		this._material = material;
		this.#projection = new Matrix4();
		this.#position = new Vector3();
		this.#rotation = new Vector3();
		this.#scale = new Vector3(1, 1, 1);
		this.#debugName = debugName ?? null;
	}

	getDebugName() {
		return this.#debugName;
	}

	getGeometry() {
		return this._geometry;
	}

	getMaterial() {
		return this._material;
	}

	getProjection() {
		return this.#projection;
	}

	updateProjection() {
		this.#projection = Matrix4.translation(this.#position)
			.multiply(Matrix4.rotation(this.#rotation))
			.multiply(Matrix4.scale(this.#scale));
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
}