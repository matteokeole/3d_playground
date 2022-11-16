import {Matrix4} from "../math/Matrix4.js";

export function OrthographicCamera(left, right, top, bottom, near, far) {
	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;
	this.near = near;
	this.far = far;
	this.projectionMatrix = Matrix4.orthographic(left, right, top, bottom, near, far);
}