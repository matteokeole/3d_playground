/**
 * Bi-dimensional vector class.
 * 
 * @constructor
 * @param {number} x
 * @param {number} y
 * @throws {TypeError}
 */
export function Vector2(x, y) {
	const {length} = arguments;

	if (length < 2) throw TypeError(`Failed to create Vector3 instance: 2 arguments required, but only ${length} present.`);

	this.x = x;
	this.y = y;
}

/**
 * @param {Vector2} v
 */
Vector2.prototype.add = function(v) {
	return new Vector2(
		this.x + v.x,
		this.y + v.y,
	);
};

/**
 * @param {number} n
 */
Vector2.prototype.addScalar = function(n) {
	return new Vector2(
		this.x + n,
		this.y + n,
	);
};

/**
 * @param {Vector2} v
 */
Vector2.prototype.distanceTo = function(v) {
	return Math.sqrt(
		(v.x - this.x) ** 2 +
		(v.y - this.y) ** 2,
	);
};

/**
 * @param {Vector2} v
 */
Vector2.prototype.divide = function(v) {
	return new Vector2(
		this.x / v.x,
		this.y / v.y,
	);
};

/**
 * @param {number} n
 */
Vector2.prototype.divideScalar = function(n) {
	return this.multiplyScalar(1 / n);
};

/**
 * @param {Vector2} v
 */
Vector2.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y;
};

Vector2.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

Vector2.prototype.length = function() {
	return Math.sqrt(this.lengthSquared());
};

Vector2.prototype.lengthSquared = function() {
	return this.x ** 2 + this.y ** 2;
};

/**
 * @param {Vector2} v
 * @param {number} n
 */
Vector2.prototype.lerp = function(v, n) {
	const a = this.multiplyScalar(1 - n);
	const b = v.multiplyScalar(n);

	return a.add(b);
};

/**
 * @param {Vector2} v
 */
Vector2.prototype.multiply = function(v) {
	return new Vector2(
		this.x * v.x,
		this.y * v.y,
	);
};

/**
 * @param {number} n
 */
Vector2.prototype.multiplyScalar = function(n) {
	return new Vector2(
		this.x * n,
		this.y * n,
	);
};

Vector2.prototype.normalize = function() {
	const length = this.length();

	if (length <= .00001) return new Vector2();

	return this.divideScalar(length);
};

Vector2.prototype.randomize = function() {
	return new Vector2(
		Math.random(),
		Math.random(),
	);
};

/**
 * @param {Vector2} v
 */
Vector2.prototype.substract = function(v) {
	return new Vector2(
		this.x - v.x,
		this.y - v.y,
	);
};

/**
 * @param {number} n
 */
Vector2.prototype.substractScalar = function(n) {
	return this.addScalar(-n);
};

Vector2.prototype.toArray = function() {
	return [
		this.x,
		this.y,
	];
};