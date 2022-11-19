import {Vector3} from "./math/Vector3.js";

export function Mesh(geometry, material) {
	this.geometry = geometry;
	this.material = material;
	this.position = new Vector3(0, 0, 0);
	this.rotation = new Vector3(0, 0, 0);
	this.scale = new Vector3(1, 1, 1);
	this.geometry.uvs = new Float32Array([
		// Front
		0,    1,
		0.25, 1,
		0,    0.5,
		0.25, 0.5,
		// Back
		0.5,  1,
		0.25, 1,
		0.5,  0.5,
		0.25, 0.5,
		// Left
		0,    0.5,
		0.25, 0.5,
		0,    0,
		0.25, 0,
		// Right
		0.5,  1,
		0.75, 1,
		0.5,  0.5,
		0.75, 0.5,
		// Top
		0.5,  0.5,
		0.25, 0.5,
		0.5,  0,
		0.25, 0,
		// Bottom
		0.5,  0.5,
		0.75, 0.5,
		0.5,  0,
		0.75, 0,
	]);
}