import {ImageBitmapLoader} from "../../src/Loader/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {Instance} from "./Instance.js";
import {Renderer} from "./Renderer.js";
import {listen} from "./input.js";

import {createCamera, createScene} from "./scenes/building_entrance.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const imageBitmapLoader = new ImageBitmapLoader();
	const images = await imageBitmapLoader.load("public/hl2/textures/textures.json");
	const renderer = new Renderer(canvas, await createScene(), images.length);
	const instance = new Instance({
		renderer,
		framesPerSecond: 60,
	});

	await instance.build();

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	renderer.setCamera(createCamera(viewport[0] / viewport[1]));
	renderer.loadImages(images);

	document.body.appendChild(canvas);
	listen(renderer);

	instance.loop();
}