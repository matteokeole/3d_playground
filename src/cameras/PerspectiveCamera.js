import {Camera} from "./Camera.js";
import {Matrix4} from "../math/index.js";

export function PerspectiveCamera(fov, aspect, near, far, bias = .5) {
	Camera.call(this);

	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;
	this.bias = bias;

	this.updateProjectionMatrix();
}

PerspectiveCamera.prototype = Camera.prototype;

PerspectiveCamera.prototype.updateProjectionMatrix = function() {
	const
		{fov, aspect, near, far, bias} = this,
		f = Math.tan(fov * Math.PI / 180 * bias),
		range = 1 / (near - far);

	this.projectionMatrix = new Matrix4(
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (near + far) * range, -1,
		0, 0, near * far * range * 2, 0,
	);
};