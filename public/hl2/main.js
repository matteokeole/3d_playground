import {AbstractScene} from "../../src/index.js";
import {TextureLoader} from "../../src/Loader/index.js";
import {PI, Vector2} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {Camera} from "./Camera.js";
import {listen} from "./input.js";
// import {Instance} from "./Instance.js";
import {update} from "./update.js";
import "./debug.js";

import {setup} from "./scenes/building_entrance.js";
// import {createCamera, createScene} from "./scenes/building_entrance.js";

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

	const viewport = new Vector2(innerWidth, innerHeight);

	const camera = new Camera();
	// const camera = createCamera();
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lerpFactor = CAMERA_LERP_FACTOR;
	camera.lookAt(new Vector2());

	const renderer = new Renderer(canvas);
	renderer.getViewport().set(viewport, 2);
	await renderer.build();

	const textureLoader = new TextureLoader();
	const textures = await textureLoader.load("public/hl2/textures/textures.json");

	for (let i = 0, length = textures.length; i < length; i++) {
		renderer.addTexture(textures[i]);
	}

	renderer.scene = new AbstractScene();
	// const scene = createScene(textures, textureDescriptors);
	// renderer.setScene(scene);
	renderer.camera = camera;
	// renderer.setCamera(camera);
	renderer.framesPerSecond = FRAMES_PER_SECOND;
	// const instance = new Instance({renderer, framesPerSecond: FRAMES_PER_SECOND});
	renderer.update = update; // remove

	await setup(renderer, textures); // remove
	listen(renderer);

	document.body.appendChild(canvas);

	renderer.loop();
}