import {Vector2, Vector4} from "../../../src/math/index.js";
import {FRAMES_PER_SECOND} from "../../index.js";
import {Instance} from "./Instance.js";
import {WebGPUVisibilityRenderer} from "../../../src/Platform/WebGPU/Renderer/index.js";

import {createCamera, createScene} from "./Scene/Cluster.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new WebGPUVisibilityRenderer(canvas);
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
		"public/webgpu/visibility/Shader/Visualization.wgsl",
		"public/webgpu/visibility/Shader/Quad.vert.wgsl",
		"public/webgpu/visibility/Shader/Visualization.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	const camera = createCamera();

	camera.setAspectRatio(viewport[0] / viewport[1]);

	renderer.setCamera(camera);

	const scene = await createScene();

	scene.clusterize();

	renderer.setScene(scene);

	document.body.appendChild(canvas);

	instance.loop();
}