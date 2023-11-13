import {AbstractScene} from "../../src/index.js";
import {TextureLoader} from "../../src/Loader/index.js";
import {PI, Vector2, Vector4} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {Camera} from "./Camera.js";
import {setup} from "./scenes/building_entrance.js";
import {debug} from "./debug.js";
import {listen} from "./input.js";
import {update} from "./update.js";

export const FRAMES_PER_SECOND = 60;
export const FIELD_OF_VIEW = 90;
export const ENTITY_HEIGHT_STAND = 64;
export const ENTITY_HEIGHT_CROUCH = 28;
export const ABSOLUTE_VELOCITY = 150;
export const VELOCITY = ABSOLUTE_VELOCITY / FRAMES_PER_SECOND;
export const CAMERA_LERP_FACTOR = .3;
export const SENSITIVITY = .0012;

export default async function() {
	const viewport = new Vector2(innerWidth, innerHeight);

	const renderer = new Renderer();
	renderer.getViewport().set(viewport, 2);
	await renderer.build();

	const textureLoader = new TextureLoader();
	const textures = await textureLoader.load("public/hl2/textures/textures.json");

	for (let i = 0, length = textures.length; i < length; i++) {
		renderer.addTexture(textures[i]);
	}

	document.body.appendChild(renderer.getCanvas());

	const scene = new AbstractScene();
	scene.background = new Vector4(0, 0, 0, 1);

	const camera = new Camera();
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // Try with ~1.712?
	camera.turnVelocity = SENSITIVITY;
	camera.lerpFactor = CAMERA_LERP_FACTOR;

	renderer.scene = scene;
	renderer.camera = camera;
	renderer.framesPerSecond = FRAMES_PER_SECOND;
	renderer.update = update;

	await setup(renderer, textures);
	debug(renderer);
	listen(renderer);

	camera.lookAt(new Vector2());

	renderer.prerender();
	renderer.loop();
}