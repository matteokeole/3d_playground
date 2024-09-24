import {Geometry} from "../Geometry/index.js";
import {Matrix4} from "../math/Matrix4.js";

/**
 * @typedef {Object} HullDescriptor
 * @property {Geometry} geometry
 */

export class Hull {
	#geometry;
	#world;

	/**
	 * @param {HullDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#geometry = descriptor.geometry;
		this.#world = Matrix4.identity();
	}

	getGeometry() {
		return this.#geometry;
	}

	getWorld() {
		return this.#world;
	}

	/**
	 * @param {Matrix4} world
	 */
	setWorld(world) {
		this.#world = world;
	}
}