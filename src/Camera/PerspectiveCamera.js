import {PI} from "../math/index.js";
import {Matrix4} from "../math/Matrix4.js";
import {Vector3} from "../math/Vector3.js";
import {Camera} from "./Camera.js";

export class PerspectiveCamera extends Camera {
	update() {
		this._view = Matrix4.lookAt(
			this.getPosition(),
			new Vector3(this.getPosition()).add(this.getForward()),
			this.getUp(),
		);

		this._projection = Matrix4.perspective(
			this.fieldOfView * PI / 180,
			this.aspectRatio,
			this.near,
			this.far,
			1,
			this.bias,
		).multiply(Matrix4.translation(new Vector3(this.getDistance()).multiplyScalar(-1)));

		this._viewProjection = new Matrix4(this._projection).multiply(this._view);
	}
}