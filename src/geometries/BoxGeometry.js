export function BoxGeometry(width, height, depth) {
	const
		w = width / 2,
		h = height / 2,
		d = depth / 2;

	this.width = width;
	this.height = height;
	this.depth = depth;
	this.vertices = new Float32Array([
	   -w,  h,  d,		w,  h,  d,	   -w, -h,  d,		w, -h,  d,		// Front
		w,  h, -d,	   -w,  h, -d,		w, -h, -d,	   -w, -h, -d,		// Back
	   -w,  h, -d,	   -w,  h,  d,	   -w, -h, -d,	   -w, -h,  d,		// Left
		w,  h,  d,		w,  h, -d,		w, -h,  d,		w, -h, -d,		// Right
	   -w,  h, -d,		w,  h, -d,	   -w,  h,  d,		w,  h,  d,		// Top
		w, -h, -d,	   -w, -h, -d,		w, -h,  d,	   -w, -h,  d,		// Bottom
	]);
	this.normals = new Float32Array([
		0,  0,  1,		0,  0,  1,		0,  0,  1,		0,  0,  1,
		0,  0, -1,		0,  0, -1,		0,  0, -1,		0,  0, -1,
	   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,
		1,  0,  0,		1,  0,  0,		1,  0,  0,		1,  0,  0,
		0,  1,  0,		0,  1,  0,		0,  1,  0,		0,  1,  0,
		0, -1,  0,		0, -1,  0,		0, -1,  0,		0, -1,  0,
	]);
	this.indices = new Uint8Array([
		0,  2,  1,		2,  3,  1,
		8,  10, 9,		10, 11, 9,
		12, 14, 13,		14, 15, 13,
		4,  6,  5,		6,  7,  5,
		16, 18, 17,		18, 19, 17,
		20, 22, 21,		22, 23, 21,
	]);
};