import {Matrix4} from "../math/Matrix4.js";
import {Camera} from "./Camera.js";

export class OrthographicCamera extends Camera {
	/**
	 * @param {Number} left
	 * @param {Number} right
	 * @param {Number} bottom
	 * @param {Number} top
	 * @param {Number} near
	 * @param {Number} far
	 */
	constructor(left, right, bottom, top, near, far) {
		super();

		this._projection = Matrix4.orthographic(left, right, bottom, top, near, far);
	}

	update() {
		const invertTransform = Matrix4.translation(this.getPosition()).invert();

		this._view = invertTransform;
		this._viewProjection = new Matrix4(this._projection).multiply(this._view);
	}
}