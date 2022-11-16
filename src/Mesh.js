import {Vector3} from "./math/Vector3.js";

export function Mesh(geometry, material) {
	this.geometry = geometry;
	this.material = material;
	this.position = new Vector3(0, 0, 0);
	this.rotation = new Vector3(0, 0, 0);
	this.scale = new Vector3(1, 1, 1);
}