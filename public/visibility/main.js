import {Vector2, Vector4} from "../../src/math/index.js";
import {Instance} from "./Instance.js";
import {VisibilityRenderer} from "./VisibilityRenderer.js";
import {listen} from "./input.js";

import {createCamera, createScene} from "./scenes/multipleGeometries.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new VisibilityRenderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: 60,
	});

	await instance.build();

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	renderer.setScene(await createScene());
	renderer.setCamera(createCamera(viewport[0] / viewport[1]));

	document.body.appendChild(canvas);
	listen(renderer);

	instance.loop();
}