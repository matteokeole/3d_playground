import {ENTITY_HEIGHT_STAND} from "./constants.js";
import {DirectionalLight} from "../src/lights/index.js";
import {Vector3} from "../src/math/index.js";

import testColumns from "./tests/testColumns.js";
// import testFov from "./tests/testFov.js";
// import testUV from "./tests/testUV.js";
// import testChunk from "./tests/testChunk.js";
// import testLargeChunk from "./tests/testLargeChunk.js";

export function build(renderer) {
	const scene = renderer.scene;
	const camera = renderer.camera;

	camera.position[1] = camera.target[1] = ENTITY_HEIGHT_STAND;

	const light = new DirectionalLight(
		new Vector3(.8, .2, .15),
		new Vector3(1, 1, 1), // RGB
		1,
	);

	scene.directionalLight = light;
	scene.meshes = testColumns(renderer.textures);
}