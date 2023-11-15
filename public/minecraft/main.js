import {AbstractCamera, AbstractScene} from "../../src/index.js";
import {TextureLoader} from "../../src/Loader/index.js";
import {PI, Vector2, Vector4} from "../../src/math/index.js";
import {Renderer} from "./Renderer.js";
import {setup} from "./scenes/instancing.js";
import "./debug.js";
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

	const textureLoader = new TextureLoader();
	const textures = await textureLoader.load("public/minecraft/textures/textures.json");

	for (let i = 0, length = textures.length; i < length; i++) {
		renderer.addTexture(textures[i]);
	}

	const camera = new AbstractCamera();
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = viewport[0] / viewport[1];
	camera.near = .01;
	camera.far = 1000;
	camera.bias = PI * .5; // This cancels the perspective matrix bias
	camera.turnVelocity = .001;

	renderer.scene = new AbstractScene();
	renderer.camera = camera;
	renderer.framesPerSecond = FRAMES_PER_SECOND;
	renderer.update = update;

	setup(renderer);
	listen(renderer);

	renderer.prerender();

	document.body.appendChild(renderer.getCanvas());

	renderer.loop();
}