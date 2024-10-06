import {Trigger} from "./Trigger.js";
import {NotImplementedError} from "../Error/index.js";
import {Mesh} from "../Mesh/index.js";

/**
 * @abstract
 */
export class IntersectionTrigger extends Trigger {
	/**
	 * Returns the type of the object the trigger will search intersections for.
	 * 
	 * @returns {Object}
	 */
	getObjectType() {
		throw new NotImplementedError();
	}

	/**
	 * @param {Mesh} mesh
	 */
	onIntersect(mesh) {
		throw new NotImplementedError();
	}
}