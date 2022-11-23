/**
 * Tri-dimensional vector class.
 * 
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @throws {TypeError}
 */
export function Vector3(x, y, z) {
	const {length} = arguments;

	if (length < 3) throw TypeError(`Failed to create Vector3 instance: 3 arguments required, but only ${length} present.`);

	this.x = x;
	this.y = y;
	this.z = z;
}

/**
 * @param {Vector3} v
 */
Vector3.prototype.add = function(v) {
	return new Vector3(
		this.x + v.x,
		this.y + v.y,
		this.z + v.z,
	);
};

/**
 * @param {number} n
 */
Vector3.prototype.addScalar = function(n) {
	return new Vector3(
		this.x + n,
		this.y + n,
		this.z + n,
	);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.cross = function(v) {
	return new Vector3(
		this.y * v.z - this.z * v.y,
		this.z * v.x - this.x * v.z,
		this.x * v.y - this.y * v.x,
	);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.distanceTo = function(v) {
	return Math.sqrt(
		(v.x - this.x) ** 2 +
		(v.y - this.y) ** 2 +
		(v.z - this.z) ** 2,
	);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.divide = function(v) {
	return new Vector3(
		this.x / v.x,
		this.y / v.y,
		this.z / v.z,
	);
};

/**
 * @param {number} n
 */
Vector3.prototype.divideScalar = function(n) {
	return this.multiplyScalar(1 / n);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y + this.z * v.z;
};

Vector3.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

Vector3.prototype.length = function() {
	return Math.sqrt(this.lengthSquared());
};

Vector3.prototype.lengthSquared = function() {
	return this.x ** 2 + this.y ** 2 + this.z ** 2;
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.multiply = function(v) {
	return new Vector3(
		this.x * v.x,
		this.y * v.y,
		this.z * v.z,
	);
};

/**
 * @param {number} n
 */
Vector3.prototype.multiplyScalar = function(n) {
	return new Vector3(
		this.x * n,
		this.y * n,
		this.z * n,
	);
};

Vector3.prototype.normalize = function() {
	const length = this.length();

	if (length <= .00001) return new Vector3();

	return this.divideScalar(length);
};

Vector3.prototype.randomize = function() {
	return new Vector3(
		Math.random(),
		Math.random(),
		Math.random(),
	);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.substract = function(v) {
	return new Vector3(
		this.x - v.x,
		this.y - v.y,
		this.z - v.z,
	);
};

/**
 * @param {number} n
 */
Vector3.prototype.substractScalar = function(n) {
	return this.addScalar(-n);
};