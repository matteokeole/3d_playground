import {TEXTURES} from "../constants.js";
import {Vector3} from "../../src/math/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Mesh} from "../../src/Mesh.js";

export default function() {
	const
		meshes = [],
		geometry = new BoxGeometry(1, 1, 1),
		material = new Material({
			texture: TEXTURES["misc/white.png"],
		}),
		scale = .85,
		scaleVector = new Vector3(1, 1, 1).multiplyScalar(scale);
	let mesh, i = 0;

	for (; i < 26; i++) {
		mesh = new Mesh(geometry, material);
		mesh.position = new Vector3(0, 0, i * scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 7; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.position = new Vector3(-1, 1, i * 4 + 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);

		mesh = new Mesh(geometry, material.test);
		mesh.position = new Vector3(-1, 2, i * 4 + 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.position = new Vector3(1, i + 1, 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.position = new Vector3(1, i + 1, 25).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	return meshes;
}