import {PerspectiveCamera} from "../../src/Camera/index.js";
import {ImageBitmapLoader} from "../../src/Loader/index.js";
import {PI, SQRT1_2, Vector2} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {enableDebugging} from "./debug.js";
import {listen} from "./input.js";
import {Instance} from "./Instance.js";

import {createScene} from "./scenes/perspective_shadow.js";

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

	const camera = new PerspectiveCamera();
	camera.getPosition()[1] = CAMERA_HEIGHT;
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .01;
	camera.far = 200;
	camera.bias = PI * .5; // This cancels the perspective matrix bias
	camera.turnVelocity = .001;

	renderer.setScene(createScene());
	renderer.setCamera(camera);

	enableDebugging(renderer);
	listen(renderer);

	renderer.prerender();

	document.body.appendChild(canvas);

	instance.loop();
}