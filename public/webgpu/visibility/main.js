import {Matrix4, Vector2, Vector3, Vector4} from "../../../src/math/index.js";
import {Renderer} from "../../../src/Renderer/index.js";
import {FRAMES_PER_SECOND} from "../../index.js";
import {Instance} from "./Instance.js";
import {VisibilityRenderer} from "./VisibilityRenderer.js";

import {createCamera, createScene} from "./Scene/Cluster.js";

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

	const camera = createCamera();

	camera.setAspectRatio(viewport[0] / viewport[1]);

	renderer.setCamera(camera);

	const scene = await createScene();

	scene.clusterize();

	renderer.setScene(scene);

	// test(renderer);

	document.body.appendChild(canvas);

	instance.loop();
}

/**
 * @param {Renderer} renderer
 */
/* function test(renderer) {
	let clipSpaceVertex;
	let clipSpaceUv;

	// Get clip-space vertex
	{
		const cluster = renderer.getScene().getMeshes()[0];
		const vertex = new Vector3(...cluster.getGeometry().getVertices().subarray(0, 3));

		const viewProjection = renderer.getCamera().getViewProjection();
		const world = cluster.getProjection();
		const worldViewProjection = new Matrix4(viewProjection).multiply(world);

		clipSpaceVertex = vertex.multiplyMatrix(worldViewProjection);
	}

	// Get clip-space UV
	{
		const uv = new Vector2(500, 418);
		const viewport = renderer.getViewport();
		const width = viewport[2];
		const height = viewport[3];

		clipSpaceUv = new Vector2(uv);
		clipSpaceUv[0] /= width;
		clipSpaceUv[1] /= height;
		// = [0, 1]

		clipSpaceUv.multiplyScalar(2);
		// = [0, 2]

		clipSpaceUv.subtractScalar(1);
		// = [-1, 1]
	}

	console.log(clipSpaceVertex, clipSpaceUv);
} */