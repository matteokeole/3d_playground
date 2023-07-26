import {AbstractCamera} from "src";
import {Vector3} from "src/math";

export class Camera extends AbstractCamera {
	getRelativeVelocity(direction) {
		const right = this.right.clone();
		const forward = this.right.cross(new Vector3(0, 1, 0));

		const relativeVelocity = right
			.multiplyScalar(direction[0])
			.add(forward.multiplyScalar(direction[2]));
		relativeVelocity[1] += direction[1];

		return relativeVelocity;
	}
}