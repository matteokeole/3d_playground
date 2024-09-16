import {ImageBitmapLoader} from "../../src/Loader/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {Instance} from "./Instance.js";

import {createCamera, createScene} from "./scenes/building_entrance.js";

export const FRAMES_PER_SECOND = 60;
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
	const textureDescriptors = await imageBitmapLoader.load("public/hl2/textures/textures.json");

	// const captureSessionLoader = new CaptureSessionLoader();
	// const captureSession = await captureSessionLoader.load("assets/capture/rotation/pitch.json");

	const camera = createCamera();
	// camera.setCaptureSession(captureSession);

	camera.setAspectRatio(viewport[0] / viewport[1]);

	renderer.loadTextures(textureDescriptors);
	renderer.setScene(await createScene(textureDescriptors));
	renderer.setCamera(camera);

	document.body.appendChild(canvas);

	instance.loop();
}