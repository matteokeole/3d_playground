import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {clamp, rad, toEulerAngles} from "../../../../src/math/index.js";

export class ThirdPersonCamera extends PerspectiveCamera {
	#minPitch = rad(-90);
	#maxPitch = rad(90);

	updateView() {
		const eulerAngles = toEulerAngles(this.getOrientation());

		// Pitch rotation constraint
		let pitch = this.getRotationAccumulator()[0];
		pitch = clamp(pitch, this.#minPitch - eulerAngles[0], this.#maxPitch - eulerAngles[0]);

		this.getRotationAccumulator()[0] = pitch;

		return super.updateView();
	}
}