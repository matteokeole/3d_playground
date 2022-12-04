import {FIELD_OF_VIEW} from "./constants.js";
import {Renderer} from "../src/Renderer.js";
import {Scene} from "../src/Scene.js";
import {PerspectiveCamera} from "../src/cameras/index.js";
import {Color} from "../src/Color.js";
import {loadImages, loadTextures} from "../src/utils/index.js";
import init from "./init.js";
import loop from "./loop.js";
import {initGUI} from "./gui.js";
import {NoWebGL2Error} from "../src/errors/NoWebGL2Error.js";

export let scene, camera;

/**
 * @todo Handle WebGL context loss event
 * @todo Handle Fetch API compatibility
 */
try {
	Renderer.build();

	scene = new Scene({background: new Color(0x202124)});
	camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, .01, 50);

	Renderer.bindCamera(camera);
	await Renderer.init();

	const textures = await (await fetch("public/textures.json")).json();
	await loadTextures(Renderer.getContext(), textures);

	const images = await (await fetch("public/images.json")).json();
	await loadImages(images);

	init(scene, camera);
	initGUI();

	Renderer.prepareRender(scene, camera);
	loop.start();
} catch (error) {
	console.error(error);

	if (error instanceof NoWebGL2Error) {
		document.body.appendChild(error.getTemplate());
	}
}