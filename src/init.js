import {TEXTURES} from "./constants.js";
import {Mesh} from "./Mesh.js";
import {BoxGeometry} from "./geometries/index.js";
import {Material} from "./materials/index.js";
import {Vector3} from "./math/index.js";

export default function(scene) {
	const meshes = [];

    // Ubuntu Chrome: avg FPS 59 with 500 instanced meshes (1min, stable)
	for (let i = 0; i < 500; i++) {
		const mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new Material({
				texture: [
					TEXTURES["noodles.jpg"],
				],
			}),
		);
		mesh.position = new Vector3(0, -1, i);
		mesh.scale = new Vector3(.8, .8, .8);

		meshes.push(mesh);
	}

	scene.add(...meshes);
}