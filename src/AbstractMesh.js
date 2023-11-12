import {Geometry} from "./geometries/index.js";
import {Vector3} from "./math/index.js";
import {AbstractMaterial} from "./materials/index.js";

/**
 * @abstract
 */
export class AbstractMesh {
	/**
	 * @type {Geometry}
	 */
	_geometry;

	/**
	 * @type {AbstractMaterial}
	 */
	_material;

	/**
	 * @type {Vector3}
	 */
	#position = new Vector3(0, 0, 0);

	/**
	 * @type {Vector3}
	 */
	#rotation = new Vector3(0, 0, 0);

	/**
	 * @type {Vector3}
	 */
	#scale = new Vector3(1, 1, 1);

	/**
	 * @param {Geometry} geometry
	 * @param {AbstractMaterial} material
	 */
	constructor(geometry, material) {
		this._geometry = geometry;
		this._material = material;
	}

	getGeometry() {
		return this._geometry;
	}

	getMaterial() {
		return this._material;
	}

	/**
	 * @returns {Vector3}
	 */
	get position() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	set position(position) {
		this.#position = position;
	}

	/**
	 * @returns {Vector3}
	 */
	get rotation() {
		return this.#rotation;
	}

	/**
	 * @param {Vector3} rotation
	 */
	set rotation(rotation) {
		this.#rotation = rotation;
	}

	/**
	 * @returns {Vector3}
	 */
	get scale() {
		return this.#scale;
	}

	/**
	 * @param {Vector3} scale
	 */
	set scale(scale) {
		this.#scale = scale;
	}
}