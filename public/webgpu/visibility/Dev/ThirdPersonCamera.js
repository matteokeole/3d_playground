import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Matrix4, Vector3} from "../../../../src/math/index.js";

export class ThirdPersonCamera extends PerspectiveCamera {
	static #DISTANCE = new Vector3(0, 0, 256);

	/* updateProjection() {
		const projection = super.updateProjection();
		const translation = Matrix4.translation(ThirdPersonCamera.#DISTANCE);

		return new Matrix4(projection).multiply(translation);
	} */
}