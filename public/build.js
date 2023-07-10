import {DirectionalLight} from "src/lights";
import {Vector3} from "src/math";
import {ENTITY_HEIGHT_STAND} from "./main.js";

import testColumns from "./tests/testColumns.js";
// import testFov from "./tests/testFov.js";
// import testUV from "./tests/testUV.js";
// import testChunk from "./tests/testChunk.js";
// import testLargeChunk from "./tests/testLargeChunk.js";

export function build(renderer) {
	const scene = renderer.scene;
	const camera = renderer.camera;

	camera.position[1] = ENTITY_HEIGHT_STAND;
	camera.target[1] = ENTITY_HEIGHT_STAND;

	scene.directionalLight = new DirectionalLight({
		color: new Vector3(1, 1, 1),
		intensity: 1,
		direction: new Vector3(-.8, -.2, .15),
	});
	scene.meshes = testColumns(renderer.textures);
}