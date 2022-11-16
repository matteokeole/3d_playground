import {Matrix4, Vector3} from "../math/index.js";

export function PerspectiveCamera(fov, aspect, near, far) {
	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;
	this.position = new Vector3(0, 0, 0);
	this.rotation = new Vector3(0, 0, 0);
	this.up = new Vector3(0, 1, 0);
	// Convert the client left-hand coordinate system (+ forward, - backward)
	// to a valid WebGL right-hand coordinate system (- forward, + backward)
	this.lhcs = new Vector3(-1, -1, 1);

	const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
	const range = 1 / (near - far);
	this.projectionMatrix = new Matrix4(
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (near + far) * range, -1,
		0, 0, near * far * range * 2, 0,
	);
}

PerspectiveCamera.prototype.lookAround = function(mx, my) {
	const
		x = -my / 1000,
		y = mx / 1000;

	// Prevent < -180° or > 180° rotation along the X axis
	if (
		x < 0 && this.rotation.x >= -Math.PI / 2 ||
		x > 0 && this.rotation.x <= Math.PI / 2
	) this.rotation.x += x;

	this.rotation.y += y;
}