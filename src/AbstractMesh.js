import {AbstractGeometry} from "./geometries/index.js";
import {Vector3} from "./math/index.js";
import {AbstractMaterial} from "./materials/index.js";

/**
 * @abstract
 */
export class AbstractMesh {
	/**
	 * @type {AbstractGeometry}
	 */
	#geometry;

	/**
	 * @type {AbstractMaterial}
	 */
	#material;

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
	 * @param {AbstractGeometry} geometry
	 * @param {AbstractMaterial} material
	 */
	constructor(geometry, material) {
		this.#geometry = geometry;
		this.#material = material;
	}

	/**
	 * @returns {AbstractGeometry}
	 */
	get geometry() {
		return this.#geometry;
	}

	/**
	 * @returns {AbstractMaterial}
	 */
	get material() {
		return this.#material;
	}

	/**
	 * @returns {Vector3}
	 */
	get position() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 * @returns {Plane}
	 */
	set position(position) {
		this.#position = position;

		return this;
	}

	/**
	 * @returns {Vector3}
	 */
	get rotation() {
		return this.#rotation;
	}

	/**
	 * @param {Vector3} rotation
	 * @returns {Plane}
	 */
	set rotation(rotation) {
		this.#rotation = rotation;

		return this;
	}

	/**
	 * @returns {Vector3}
	 */
	get scale() {
		return this.#scale;
	}

	/**
	 * @param {Vector3} scale
	 * @returns {Plane}
	 */
	set scale(scale) {
		this.#scale = scale;

		return this;
	}
}