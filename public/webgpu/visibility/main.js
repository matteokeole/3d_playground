import {Vector2, Vector4} from "../../../src/math/index.js";
import {FRAMES_PER_SECOND} from "../../index.js";
import {listen} from "./input.js";
import {Instance} from "./Instance.js";
import {Renderer} from "./Renderer.js";

import {createCamera, createScene} from "./scenes/obj.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	await instance.build();

	await renderer.loadShader(
		"visibility",
		"public/webgpu/visibility/shaders/visibility.wgsl",
		"public/webgpu/visibility/shaders/visibility.vert.wgsl",
		"public/webgpu/visibility/shaders/visibility.frag.wgsl",
	);
	await renderer.loadShader(
		"base",
		"public/webgpu/visibility/shaders/base.vert.wgsl",
		"public/webgpu/visibility/shaders/base.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	renderer.setCamera(createCamera(viewport[0] / viewport[1]));

	const scene = await createScene();

	renderer.setScene(scene);

	document.body.appendChild(canvas);
	listen(renderer);

	instance.loop();
}