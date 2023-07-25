import {AbstractCamera, AbstractScene} from "src";
import {PI, Vector2, Vector4} from "src/math";
import {Renderer} from "./Renderer.js";
import {setup} from "./scenes/swept_aabb.js";
import {debug} from "./debug.js";
import {listen} from "./input.js";
import {update} from "./update.js";

export const FRAMES_PER_SECOND = 60;
export const FIELD_OF_VIEW = 90;
export const ENTITY_HEIGHT_STAND = 64;
export const ENTITY_HEIGHT_CROUCH = 28;
export const ABSOLUTE_VELOCITY = 150;
export const VELOCITY = ABSOLUTE_VELOCITY / FRAMES_PER_SECOND;
export const CAMERA_LERP_FACTOR = .85;
export const SENSITIVITY = .0012;

export default async function() {
	const viewport = new Vector2(innerWidth, innerHeight);

	const renderer = new Renderer();
	renderer.viewport.set(viewport, 2);
	await renderer.build();

	const paths = await (await fetch("public/hl2/textures/textures.json")).json();
	await renderer.loadTextures("public/hl2/textures/", paths);

	document.body.appendChild(renderer.canvas);

	const scene = new AbstractScene();
	scene.background = new Vector4(1, 1, 1, 1);

	const camera = new AbstractCamera();
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // Try with ~1.712?
	camera.turnVelocity = SENSITIVITY;

	renderer.scene = scene;
	renderer.camera = camera;
	renderer.framesPerSecond = FRAMES_PER_SECOND;
	renderer.update = update;

	await setup(renderer);
	debug(renderer);
	listen(renderer);

	renderer.prerender();
	renderer.loop();
}