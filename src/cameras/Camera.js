import {SENSITIVITY} from "../constants.js";
import {Vector3} from "../math/index.js";

export function Camera() {
	this.position = new Vector3(0, 0, 0);
	this.rotation = new Vector3(0, 0, 0);
	this.distance = new Vector3(0, 0, 0);
	// Convert the client left-hand coordinate system (+ forward, - backward)
	// to a valid WebGL right-hand coordinate system (- forward, + backward)
	this.lhcs = new Vector3(-1, -1, 1);
}

Camera.prototype.lookAround = function(mx, my) {
	const
		x = my / SENSITIVITY,
		y = mx / SENSITIVITY;

	// Prevent < -180° or > 180° rotation along the X axis
	if (
		x < 0 && this.rotation.x >= -Math.PI / 2 ||
		x > 0 && this.rotation.x <= Math.PI / 2
	) this.rotation.x += x;

	this.rotation.y += y;
};

Camera.prototype.moveX = function(n) {
	const direction = new Vector3(
		Math.cos(this.rotation.y),
		0,
	   -Math.sin(this.rotation.y),
	).multiplyScalar(n);

	this.position = this.position.add(direction);
};

Camera.prototype.moveY = function(n) {
	this.position.y += n;
};

Camera.prototype.moveZ = function(n) {
	const direction = new Vector3(
		Math.sin(this.rotation.y),
		0,
		Math.cos(this.rotation.y),
	).multiplyScalar(n);

	this.position = this.position.add(direction);
};