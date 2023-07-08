import {SENSITIVITY} from "../../public/constants.js";
import {Vector3} from "../math/index.js";

export function Camera() {
	this.position = new Vector3();
	this.target = new Vector3();
	this.rotation = new Vector3();
	this.distance = new Vector3();
	// Convert the client left-hand coordinate system (+ forward, - backward)
	// to a valid WebGL right-hand coordinate system (- forward, + backward)
	this.lhcs = new Vector3(-1, -1, 1);
}

Camera.prototype.lookAround = function(mx, my) {
	const x = my / SENSITIVITY;
	const y = mx / SENSITIVITY;

	// Prevent < -180° or > 180° rotation along the X axis
	if (
		x < 0 && this.rotation[0] >= -Math.PI / 2 ||
		x > 0 && this.rotation[0] <= Math.PI / 2
	) this.rotation[0] += x;

	this.rotation[1] += y;
};

Camera.prototype.moveTargetX = function(n) {
	const direction = new Vector3(
		Math.cos(this.rotation[1]),
		0,
	   -Math.sin(this.rotation[1]),
	).multiplyScalar(n);

	this.target.add(direction);
};

Camera.prototype.moveTargetY = function(n) {
	this.target[1] += n;
};

Camera.prototype.moveTargetZ = function(n) {
	const direction = new Vector3(
		Math.sin(this.rotation[1]),
		0,
		Math.cos(this.rotation[1]),
	).multiplyScalar(n);

	this.target.add(direction);
};