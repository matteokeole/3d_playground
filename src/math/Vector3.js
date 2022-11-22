/**
 * Tri-dimensional vector class.
 * 
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function Vector3(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

/**
 * @param {Vector3} v
 * @returns {Vector3}
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
 * @returns {Vector3}
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
 * @returns {Vector3}
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
 * @returns {Vector3}
 */
Vector3.prototype.divideScalar = function(n) {
	return new Vector3(
		this.x / n,
		this.y / n,
		this.z / n,
	);
};

/**
 * @returns {Vector3}
 */
Vector3.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

/**
 * @param {Vector3} v
 * @returns {Vector3}
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
 * @returns {Vector3}
 */
Vector3.prototype.multiplyScalar = function(n) {
	return new Vector3(
		this.x * n,
		this.y * n,
		this.z * n,
	);
};

/**
 * @param {Vector3} v
 * @returns {Vector3}
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
 * @returns {Vector3}
 */
Vector3.prototype.substractScalar = function(n) {
	return new Vector3(
		this.x - n,
		this.y - n,
		this.z - n,
	);
};