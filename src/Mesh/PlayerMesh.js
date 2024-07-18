import {Mesh} from "./Mesh.js";
import {Geometry} from "../Geometry/index.js";
import {Material} from "../Material/index.js";
import {Vector3} from "../math/index.js";

/**
 * @typedef {Object} PlayerDescriptor
 * @property {Mesh} mesh
 * @property {Vector3} position
 */

export class PlayerMesh extends Mesh {
	#velocity;
	#acceleration;

	/**
	 * @param {Geometry} geometry
	 * @param {Material} material
	 * @param {?String} [debugName]
	 */
	constructor(geometry, material, debugName) {
		super(geometry, material, debugName);

		this.#velocity = new Vector3();
		this.#acceleration = new Vector3();
	}

	getVelocity() {
		return this.#velocity;
	}

	getAcceleration() {
		return this.#acceleration;
	}
}