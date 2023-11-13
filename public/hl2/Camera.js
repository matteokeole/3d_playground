import {AbstractCamera} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";

export class Camera extends AbstractCamera {
	/**
	 * @param {Vector3} velocity
	 */
	getRelativeVelocity(velocity) {
		const right = this.right
			.clone()
			.multiplyScalar(velocity[0]);
		const up = new Vector3(0, velocity[1], 0);
		const forward = this.right
			.cross(new Vector3(0, 1, 0))
			.multiplyScalar(velocity[2]);

		return right.add(up).add(forward);
	}
}