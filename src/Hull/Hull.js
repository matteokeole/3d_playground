import {PhysicalObject} from "../index.js";
import {Geometry} from "../Geometry/index.js";
import {Matrix4} from "../math/index.js";

/**
 * @typedef {Object} HullDescriptor
 * @property {Geometry} geometry
 */

export class Hull extends PhysicalObject {
	/**
	 * @param {HullDescriptor} descriptor
	 */
	constructor(descriptor) {
		super({
			geometry: descriptor.geometry,
			world: Matrix4.identity(),
		});
	}
}