import {PhysicalObject} from "../PhysicalObject.js";
import {Matrix4, Vector3} from "../math/index.js";
import {TriggerState} from "./TriggerState.js";

/**
 * @abstract
 */
export class Trigger extends PhysicalObject {
	#position;
	#state;

	/**
	 * @param {import("../PhysicalObject.js").PhysicalObjectDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#position = new Vector3(0, 0, 0);
		this.#state = TriggerState.ON;
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

	getState() {
		return this.#state;
	}

	/**
	 * @param {TriggerState} state
	 */
	setState(state) {
		this.#state = state;
	}

	updateWorld() {
		const world = Matrix4.translation(this.#position);

		this.setWorld(world);
	}
}