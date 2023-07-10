import {Mesh} from "src";
import {BoxGeometry} from "src/geometries";
import {TextureMaterial} from "src/materials";
import {Vector3} from "src/math";
import {BLOCK_SCALE} from "../main.js";

// CURR/MAX FPS - 120K instanced meshes
// Windows 10/Chrome: 165/165 FPS
// Ubuntu/Firefox: 38/60 FPS
export default function(textures, n = 300) {
	const meshes = [];
	let i, j, k;
	i = j = k = 0;

	for (; i < n; i++) {
		const mesh = new Mesh(
			new BoxGeometry(new Vector3(1, 1, 1)),
			new TextureMaterial({
				texture: textures["block/sculk.png"],
			}),
		);

		if (i % 10 === 0) j++;
		if (i % 100 === 0) k++;

		mesh.position = new Vector3(i % 10 - 4.5, 1 - k, j % 10 - 4.5);
		mesh.scale = new Vector3(BLOCK_SCALE, BLOCK_SCALE, BLOCK_SCALE);

		meshes.push(mesh);
	}

	return meshes;
}