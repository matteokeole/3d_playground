import {SCALE, TEXTURES} from "../constants.js";
import {Vector3} from "../../src/math/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Mesh} from "../../src/Mesh.js";

// Windows Chrome (max. 165): 165 FPS with 120k instanced meshes
// Ubuntu Firefox (max. 60): 38 FPS with 120k instanced meshes (slowness on other applications)
export default function(n = 300) {
	const
		meshes = [],
		geometry = new BoxGeometry(1, 1, 1);
	let i, j, k;
	i = j = k = 0;

	for (; i < n; i++) {
		const mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new Material({
				texture: TEXTURES["block/sculk.png"],
			}),
		);

		if (i % 10 === 0) j++;
		if (i % 100 === 0) k++;

		mesh.position = new Vector3(i % 10 - 4.5, 1 - k, j % 10 - 4.5);
		mesh.scale = new Vector3(1, 1, 1).multiplyScalar(SCALE);

		meshes.push(mesh);
	}

	return meshes;
}