import {PLAYER_HEIGHT} from "./constants.js";
import {Color} from "../src/Color.js";
import {DirectionalLight} from "../src/lights/index.js";
import {Vector3} from "../src/math/index.js";
// import testColumns from "./tests/testColumns.js";
import testFov from "./tests/testFov.js";
// import testUV from "./tests/testUV.js";
// import testNoise from "./tests/testNoise.js";

export default function(scene, camera) {
	camera.position.y = camera.target.y = PLAYER_HEIGHT;

	const light = new DirectionalLight(
		new Vector3(.8, .2, .15),
		new Color(0xffffff),
		1,
	);

	scene.directionalLight = light;
	scene.add(...testFov());
}