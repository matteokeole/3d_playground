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