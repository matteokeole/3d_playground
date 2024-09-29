import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {clamp, rad, toEulerAngles} from "../../../../src/math/index.js";

export class ThirdPersonCamera extends PerspectiveCamera {
	#minPitch = -90;
	#maxPitch = 90;

	updateView() {
		const eulerAngles = toEulerAngles(this.getOrientation());

		this.getRotationAccumulator()[0] = clamp(
			this.getRotationAccumulator()[0],
			rad(this.#minPitch) - eulerAngles[0],
			rad(this.#maxPitch) - eulerAngles[0],
		);

		return super.updateView();
	}
}