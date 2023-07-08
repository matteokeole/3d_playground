import {Vector3} from "../math/index.js";

/** @param {Vector3} size */
export function BoxGeometry(size) {
	this.width = size[0];
	this.height = size[1];
	this.depth = size[2];

	const [w, h, d] = size.multiplyScalar(.5);

	this.indices = Uint8Array.of(
		0,  2,  1,		2,  3,  1,
		8,  10, 9,		10, 11, 9,
		12, 14, 13,		14, 15, 13,
		4,  6,  5,		6,  7,  5,
		16, 18, 17,		18, 19, 17,
		20, 22, 21,		22, 23, 21,
	);
	this.vertices = Float32Array.of(
	   -w,  h,  d,		w,  h,  d,	   -w, -h,  d,		w, -h,  d,		// Front
		w,  h, -d,	   -w,  h, -d,		w, -h, -d,	   -w, -h, -d,		// Back
	   -w,  h, -d,	   -w,  h,  d,	   -w, -h, -d,	   -w, -h,  d,		// Left
		w,  h,  d,		w,  h, -d,		w, -h,  d,		w, -h, -d,		// Right
	   -w,  h, -d,		w,  h, -d,	   -w,  h,  d,		w,  h,  d,		// Top
		w, -h, -d,	   -w, -h, -d,		w, -h,  d,	   -w, -h,  d,		// Bottom
	);
	this.normals = Float32Array.of(
		0,  0,  1,		0,  0,  1,		0,  0,  1,		0,  0,  1,
		0,  0, -1,		0,  0, -1,		0,  0, -1,		0,  0, -1,
	   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,	   -1,  0,  0,
		1,  0,  0,		1,  0,  0,		1,  0,  0,		1,  0,  0,
		0,  1,  0,		0,  1,  0,		0,  1,  0,		0,  1,  0,
		0, -1,  0,		0, -1,  0,		0, -1,  0,		0, -1,  0,
	);
	this.uvs = Float32Array.of(
		1, 1,	0, 1,	1, 0,	0, 0,
		1, 1,	0, 1,	1, 0,	0, 0,
		1, 1,	0, 1,	1, 0,	0, 0,
		1, 1,	0, 1,	1, 0,	0, 0,
		1, 1,	0, 1,	1, 0,	0, 0,
		1, 1,	0, 1,	1, 0,	0, 0,
	);
};