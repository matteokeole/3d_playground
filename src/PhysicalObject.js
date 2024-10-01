import {Geometry} from "./Geometry/index.js";
import {Matrix4} from "./math/index.js";

/**
 * @typedef {Object} PhysicalObjectDescriptor
 * @property {Geometry} geometry
 * @property {Matrix4} world
 */

/**
 * Represents a geometrical object with a customizable world matrix.
 * 
 * @abstract
 */
export class PhysicalObject {
	#geometry;
	#world;

	/**
	 * @param {PhysicalObjectDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#geometry = descriptor.geometry;
		this.#world = descriptor.world;
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