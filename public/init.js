import {TEXTURES} from "./constants.js";
import {Mesh} from "../src/Mesh.js";
import {BoxGeometry} from "../src/geometries/index.js";
import {Material} from "../src/materials/index.js";
import {Vector3} from "../src/math/index.js";

export default function(scene) {
	const meshes = [];

	let i, j, k;
	i = j = k = 0;

	// Ubuntu Chrome: avg FPS 59 with 500 instanced meshes (1min, stable)
	// Windows Chrome: maximum FPS (165) with 120000 instanced meshes (stable)
	for (; i < 1000; i++) {
		const mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new Material({
				texture: [
					TEXTURES["noodles.jpg"],
				],
			}),
		);

		if (i % 10 === 0) j++;
		if (i % 100 === 0) k++;

		mesh.position = new Vector3(i % 10 - 4.5, -1 - k, j % 10 - 4.5);
		// mesh.position = new Vector3(0, -.5, 2);
		mesh.scale = new Vector3(.8, .8, .8);

		meshes.push(mesh);
	}

	scene.add(...meshes);
}