import {Vector2, Vector4} from "../../../src/math/index.js";
import {FRAMES_PER_SECOND} from "../../index.js";
import {Instance} from "./Instance.js";
import {VisibilityRenderer} from "./VisibilityRenderer.js";

import {createCamera, createScene} from "./Scene/visibility.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new VisibilityRenderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	await instance.build();

	await renderer.loadShader(
		"visibility",
		"public/webgpu/visibility/Shader/Visibility.wgsl",
		"public/webgpu/visibility/Shader/Visibility.vert.wgsl",
		"public/webgpu/visibility/Shader/Visibility.frag.wgsl",
	);
	await renderer.loadShader(
		"material",
		"public/webgpu/visibility/Shader/Material.wgsl",
		"public/webgpu/visibility/Shader/Material.vert.wgsl",
		"public/webgpu/visibility/Shader/Material.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	renderer.setCamera(createCamera(viewport[0] / viewport[1]));

	const scene = await createScene();

	scene.clusterize();

	renderer.setScene(scene);

	document.body.appendChild(canvas);

	instance.loop();
}