import {Instance} from "../../src/index.js";
import {WebGLRenderer} from "../../src/Renderer/index.js";

export default function() {
	const canvas = document.createElement("canvas");
	const renderer = new WebGLRenderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: 2,
	});

	instance.build();

	document.body.appendChild(canvas);

	instance.loop();
}