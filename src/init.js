import {TEXTURES} from "./constants.js";
import {Mesh} from "./Mesh.js";
import {BoxGeometry} from "./geometries/index.js";
import {Material} from "./materials/index.js";
import {Vector3} from "./math/index.js";

export default function(scene) {
	const mesh1 = new Mesh(
		new BoxGeometry(1, 1, 1),
		new Material({
			texture: [
				TEXTURES["noodles.jpg"],
			],
		}),
	);
	mesh1.position = new Vector3(0, 0, 2);

	const mesh2 = new Mesh(
		new BoxGeometry(.7, .7, .7),
		new Material({
			texture: [
				TEXTURES["noodles.jpg"],
			],
		}),
	);
	mesh2.position = new Vector3(-.8, -.15, 2.2);
	mesh2.rotation = new Vector3(0, -Math.PI / 5, 0);

	scene.add(mesh1, mesh2);
}