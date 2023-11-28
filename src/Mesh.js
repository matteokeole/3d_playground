import {Geometry} from "./geometries/index.js";
import {Vector3} from "./math/index.js";
import {Material} from "./materials/index.js";

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
	 * @type {Vector3}
	 */
	_position = new Vector3(0, 0, 0);

	/**
	 * @param {Geometry} geometry
	 * @param {Material} material
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

	getPosition() {
		return this._position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this._position = position;
	}
}