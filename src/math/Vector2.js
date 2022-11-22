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
 * @param {number} n
 * @returns {Vector2}
 */
 Vector2.prototype.addScalar = function(n) {
	return new Vector2(
		this.x + n,
		this.y + n,
	);
};

/**
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
 * @returns {Vector2}
 */
Vector2.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

/**
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
 * @param {Vector2} v
 * @returns {Vector2}
 */
Vector2.prototype.substract = function(v) {
	return new Vector2(
		this.x - v.x,
		this.y - v.y,
	);
};

/**
 * @param {number} n
 * @returns {Vector2}
 */
Vector2.prototype.substractScalar = function(n) {
	return new Vector2(
		this.x - n,
		this.y - n,
	);
};