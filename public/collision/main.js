import {/* CaptureSessionLoader, */ ImageBitmapLoader} from "../../src/Loader/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {listen} from "./input.js";
import {Instance} from "./Instance.js";
import "./debug.js";

import {createCamera, createScene} from "./scenes/swept_aabb.js";

export const FRAMES_PER_SECOND = 60;
export const FIELD_OF_VIEW = 90;
export const ENTITY_HEIGHT_STAND = 64;
export const ENTITY_HEIGHT_CROUCH = 28;
export const ABSOLUTE_VELOCITY = 150;
export const VELOCITY = ABSOLUTE_VELOCITY / FRAMES_PER_SECOND;
export const CAMERA_LERP_FACTOR = .3;
export const SENSITIVITY = .0012;

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	await instance.build();

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	const imageBitmapLoader = new ImageBitmapLoader();
	const imageBitmaps = await imageBitmapLoader.load("public/collision/textures/textures.json");

	// const captureSessionLoader = new CaptureSessionLoader();
	// const captureSession = await captureSessionLoader.load("assets/capture/rotation/pitch.json");

	const camera = createCamera(viewport[0] / viewport[1]);
	// camera.setCaptureSession(captureSession);

	renderer.loadTextures(imageBitmaps);
	renderer.setScene(await createScene(imageBitmaps));
	renderer.setCamera(camera);

	listen(renderer);

	document.body.appendChild(canvas);

	instance.loop();
}