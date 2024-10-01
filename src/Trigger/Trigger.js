import {PhysicalObject} from "../index.js";
import {Matrix4, Vector3} from "../math/index.js";

/**
 * @abstract
 */
export class Trigger extends PhysicalObject {
	#position;

	/**
	 * @param {import("../PhysicalObject.js").PhysicalObjectDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#position = new Vector3(0, 0, 0);
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

	updateWorld() {
		const world = Matrix4.translation(this.#position);

		this.setWorld(world);
	}
}