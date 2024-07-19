import {Debugger} from "../../src/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {listen} from "./input.js";
import {Instance} from "./Instance.js";
import {Renderer} from "./Renderer.js";

import {createCamera, createScene} from "./scenes/multipleGeometries.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const debuggerClass = new Debugger();
	const instance = new Instance({
		renderer,
		framesPerSecond: 60,
		debugger: debuggerClass,
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