/**
 * 4x4 matrix class.
 * 
 * @constructor
 * @extends Array
 * @param {...number} elements
 * @throws {TypeError}
 */
export function Matrix4(...elements) {
	const {length} = elements;

	if (length < 16) throw TypeError(`Failed to create Matrix4 instance: 16 arguments required, but only ${length} present.`);

	this?.push.apply(this, elements.slice(0, 16));
}

Matrix4.prototype = Array.prototype;

/**
 * Multiplies every element of this matrix by n.
 * 
 * @param {number} n
 * @returns {Matrix4}
 */
Matrix4.prototype.multiplyScalar = function(n) {
	const m = this;

	return new Matrix4(
		m[0] * n,  m[1] * n,  m[2] * n,  m[3] * n,
		m[4] * n,  m[5] * n,  m[6] * n,  m[7] * n,
		m[8] * n,  m[9] * n,  m[10] * n, m[11] * n,
		m[12] * n, m[13] * n, m[14] * n, m[15] * n,
	);
};

/**
 * Returns the product of this matrix by another matrix.
 * 
 * @param {Matrix4} m
 * @returns {Matrix4}
 */
Matrix4.prototype.multiplyMatrix4 = function(m) {
	const
		[a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33] = this,
		[b00, b10, b20, b30, b01, b11, b21, b31, b02, b12, b22, b32, b03, b13, b23, b33] = m;

	return new Matrix4(
		a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
		a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
		a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
		a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
		a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
		a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
		a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
		a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
		a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
		a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
		a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
		a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
		a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
		a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
		a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
		a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
	);
};

/**
 * Transposes this matrix.
 * 
 * @returns {Matrix4}
 */
Matrix4.prototype.transpose = function() {
	const m = this;

	return new Matrix4(
		m[0],  m[4],  m[8],  m[12],
		m[1],  m[5],  m[9],  m[13],
		m[2],  m[6],  m[10], m[14],
		m[3],  m[7],  m[11], m[15],
	);
};

/**
 * Creates an identity matrix.
 * 
 * @returns {Matrix4}
 */
Matrix4.identity = () => new Matrix4(
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
);

/**
 * Creates an orthographic matrix.
 * 
 * @param {number} l Left
 * @param {number} r Right
 * @param {number} t Top
 * @param {number} b Bottom
 * @param {number} n Near
 * @param {number} f Far
 * @returns {Matrix4}
 */
Matrix4.orthographic = function(l, r, t, b, n, f) {
	const nmf = n - f;

	return new Matrix4(
		2 / (r - l), 0, 0, 0,
		0, 2 / (t - b), 0, 0,
		0, 0, 2 / nmf, 0,
		(l + r) / (l - r), (b + t) / (b - t), (n + f) / nmf, 1,
	);
};

/**
 * Creates a translation matrix.
 * 
 * @param {Vector3} v
 * @returns {Matrix4}
 */
Matrix4.translation = function(v) {
	const {x, y, z} = v;

	return new Matrix4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, y, z, 1,
	);
};

/**
 * Creates a X rotation matrix.
 * 
 * @param {number} a Angle in radians
 * @returns {Matrix4}
 */
Matrix4.rotationX = a => {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		1,  0,  0,  0,
		0,  c,  s,  0,
		0, -s,  c,  0,
		0,  0,  0,  1,
	);
};

/**
 * Creates a Y rotation matrix.
 * 
 * @param {number} a Angle in radians
 * @returns {Matrix4}
 */
Matrix4.rotationY = a => {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		c,  0, -s,  0,
		0,  1,  0,  0,
		s,  0,  c,  0,
		0,  0,  0,  1,
	);
};

/**
 * Creates a Z rotation matrix.
 * 
 * @param {number} a Angle in radians
 * @returns {Matrix4}
 */
Matrix4.rotationZ = a => {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		c,  s,  0,  0,
	   -s,  c,  0,  0,
		0,  0,  1,  0,
		0,  0,  0,  1,
	);
};

/**
 * Creates a scale matrix.
 * 
 * @param {Vector3} v
 * @returns {Matrix4}
 */
Matrix4.scale = function(v) {
	const {x, y, z} = v;

	return new Matrix4(
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1,
	);
};