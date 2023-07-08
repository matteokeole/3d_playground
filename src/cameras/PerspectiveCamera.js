import {Camera} from "./Camera.js";
import {Matrix4, PI} from "../math/index.js";

export function PerspectiveCamera(fov, aspect, near, far, bias) {
	Camera.call(this);

	this.fov = fov * PI / 180;
	this.aspect = aspect;
	this.near = near;
	this.far = far;
	this.bias = bias;

	this.updateProjectionMatrix();
}

PerspectiveCamera.prototype = Camera.prototype;

PerspectiveCamera.prototype.updateProjectionMatrix = function() {
	/* const
		{fov, aspect, near, far, bias} = this,
		f = Math.tan(fov * bias),
		range = 1 / (near - far);

	/* this.projectionMatrix = new Matrix4(
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (near + far) * range, -1,
		0, 0, near * far * range * 2, 0,
	); */

	const {fov, aspect, near, far, bias} = this;
	const f = Math.tan((PI - fov) * bias);
	const rangeInv = 1 / (near - far);

	// this.projectionMatrix = Matrix4.perspective(fov, aspect, near, far);
	this.projectionMatrix = new Matrix4(
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, far * rangeInv, -1,
		0, 0, near * far * rangeInv, 0,
	);
};