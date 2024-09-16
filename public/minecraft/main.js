import {PerspectiveCamera} from "../../src/Camera/index.js";
import {ImageBitmapLoader} from "../../src/Loader/index.js";
import {SQRT1_2, Vector2, Vector3} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {enableDebugging} from "./debug.js";
import {Instance} from "./Instance.js";

import {createScene} from "./scenes/chunk.js";

export const FRAMES_PER_SECOND = 60;
export const FIELD_OF_VIEW = 90;
export const CAMERA_HEIGHT = 1.8;
export const VELOCITY = .003;
export const VELOCITY_SQRT1_2 = VELOCITY * SQRT1_2;
export const CAMERA_LERP_FACTOR = .9;
export const BLOCK_SCALE = .85;
export const NOISE_AMPLITUDE = 12;
export const NOISE_INC = .05;

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.getViewport().set(viewport, 2);

	await instance.build();

	renderer.resize();

	const imageBitmapLoader = new ImageBitmapLoader();
	const textures = await imageBitmapLoader.load("public/minecraft/textures/textures.json");

	renderer.loadTextures(textures);

	// Bias: PI / 2
	const camera = new PerspectiveCamera({
		position: new Vector3(0, CAMERA_HEIGHT, 0),
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 0.1,
		farClipPlane: 200,
	});

	camera.setAspectRatio(viewport[0] / viewport[1]);

	const scene = createScene();

	renderer.setScene(scene);
	renderer.setCamera(camera);

	enableDebugging(renderer);

	renderer.prerender();

	document.body.appendChild(canvas);

	instance.loop();
}