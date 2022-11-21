/**
 * Bi-dimensional vector class.
 * 
 * @constructor
 * @param {number} x
 * @param {number} y
 */
export function Vector2(x, y) {
	this.x = x;
	this.y = y;
}

/**
 * Adds another vector to this vector.
 * 
 * @param {Vector2} v
 * @returns {Vector2}
 */
 Vector2.prototype.add = function(v) {
	return new Vector2(
		this.x + v.x,
		this.y + v.y,
	);
};

/**
 * Divides this vector by another vector.
 * 
 * @param {Vector2} v
 * @returns {Vector2}
 */
Vector2.prototype.divide = function(v) {
	return new Vector2(
		this.x / v.x,
		this.y / v.y,
	);
};

/**
 * Divides this vector by a scalar value.
 * 
 * @param {number} n
 * @returns {Vector2}
 */
 Vector2.prototype.divideScalar = function(n) {
	return new Vector2(
		this.x / n,
		this.y / n,
	);
};

/**
 * Inverts this vector.
 * 
 * @returns {Vector2}
 */
Vector2.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

/**
 * Multiplies this vector by another vector.
 * 
 * @param {Vector2} v
 * @returns {Vector2}
 */
Vector2.prototype.multiply = function(v) {
	return new Vector2(
		this.x * v.x,
		this.y * v.y,
	);
};

/**
 * Multiplies this vector by a scalar value.
 * 
 * @param {number} n
 * @returns {Vector2}
 */
Vector2.prototype.multiplyScalar = function(n) {
	return new Vector2(
		this.x * n,
		this.y * n,
	);
};

/**
 * Subtracts another vector to this vector.
 * 
 * @param {Vector2} v
 * @returns {Vector2}
 */
Vector2.prototype.substract = function(v) {
	return new Vector2(
		this.x - v.x,
		this.y - v.y,
	);
};