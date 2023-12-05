import {Camera as _Camera} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";

export class Camera extends _Camera {
	/**
	 * @param {Vector3} velocity
	 */
	getRelativeVelocity(velocity) {
		const right = this
			.getRight()
			.clone()
			.multiplyScalar(velocity[0]);
		const up = new Vector3(0, velocity[1], 0);
		const forward = this
			.getRight()
			.cross(new Vector3(0, 1, 0))
			.multiplyScalar(velocity[2]);

		return right.add(up).add(forward);
	}
}