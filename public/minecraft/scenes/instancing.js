import {AbstractMesh as Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {DirectionalLight} from "../../../src/lights/index.js";
import {TextureMaterial} from "../../../src/materials/index.js";
import {Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, ENTITY_HEIGHT_STAND} from "../index.js";

// CURR/MAX FPS - 120K instanced meshes
// Windows 10/Chrome: 165/165 FPS
// Ubuntu/Firefox: 38/60 FPS
export function setup(renderer) {
	const {scene, camera, textures} = renderer;

	camera.position[1] = ENTITY_HEIGHT_STAND;
	camera.target[1] = ENTITY_HEIGHT_STAND;

	scene.lights.push(
		new DirectionalLight({
			color: new Vector3(1, 1, 1),
			intensity: 1,
			direction: new Vector3(-.8, -.2, .15),
		}),
	);

	const n = 300;

	for (let i = 0, j = 0, k = 0; i < n; i++) {
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

		scene.meshes.push(mesh);
	}
}