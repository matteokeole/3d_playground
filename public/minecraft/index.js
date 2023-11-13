import {AbstractCamera, AbstractScene} from "../../src/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {setup} from "./scenes/texture.js";
import {debug} from "./debug.js";
import {listen} from "./input.js";
import {update} from "./update.js";

export const FRAMES_PER_SECOND = 60;
export const FIELD_OF_VIEW = 90;
export const ENTITY_HEIGHT_STAND = 1.8;
export const VELOCITY = .003;
export const VELOCITY_SQRT1_2 = VELOCITY * Math.SQRT1_2;
export const CAMERA_LERP_FACTOR = .9;
export const BLOCK_SCALE = .85;
export const NOISE_AMPLITUDE = 12;
export const NOISE_INC = .05;

export default async function() {
	const viewport = new Vector2(innerWidth, innerHeight);

	const renderer = new Renderer();
	renderer.getViewport().set(viewport, 2);
	await renderer.build();

	const paths = await (await fetch("public/minecraft/textures/textures.json")).json();
	await renderer.loadTextures("public/minecraft/textures/", paths);

	document.body.appendChild(renderer.getCanvas());

	const scene = new AbstractScene();
	scene.background = new Vector4(.125, .129, .141, 1);

	const camera = new AbstractCamera();
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .01;
	camera.far = 1000;
	camera.bias = 0;
	camera.turnVelocity = .001;

	renderer.scene = scene;
	renderer.camera = camera;
	renderer.framesPerSecond = FRAMES_PER_SECOND;
	renderer.update = update;

	setup(renderer);
	debug(renderer);
	listen(renderer);

	renderer.prerender();
	renderer.loop();
}