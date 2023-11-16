import {Vector2, Vector4} from "../../src/math/index.js";
import {Instance} from "./Instance.js";
import {Renderer} from "./Renderer.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: 1,
	});

	await instance.build();

	renderer.setViewport(new Vector4(0, 0, innerWidth, innerHeight));
	renderer.resize();

	document.body.appendChild(canvas);

	instance.loop();
}