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
 * Divides this vector by another vector.
 * 
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
 * Divides this vector by a scalar value.
 * 
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
 * Inverts this vector.
 * 
 * @returns {Vector3}
 */
Vector3.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

/**
 * Multiplies this vector by another vector.
 * 
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
 * Multiplies this vector by a scalar value.
 * 
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