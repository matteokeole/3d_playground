import {keys} from "./constants.js";
import {Renderer} from "../src/Renderer.js";
import {Scene} from "../src/Scene.js";
import {Color} from "../src/Color.js";
import {PerspectiveCamera} from "../src/cameras/index.js";
import {loadTextures} from "../src/utils/index.js";
import init from "./init.js";
import loop from "./loop.js";

/**
 * @todo Matrix attributes instead of uniforms?
 */
export const
	scene = new Scene({background: new Color(0x202124)}),
	camera = new PerspectiveCamera(90, innerWidth / innerHeight, .01, 50),
	lookAround = ({movementX: x, movementY: y}) => camera.lookAround(x, y),
	pressKeys = ({code}) => keys.add(code),
	releaseKeys = ({code}) => keys.delete(code);

await Renderer.init();
await loadTextures(Renderer.gl, ["white.png", "black.png", "crafting_table_side.png"]);

init(scene, camera);

Renderer.prepareRender(scene, camera);
loop.start();

document.addEventListener("pointerlockchange", function() {
	if (Renderer.canvas === document.pointerLockElement) {
		addEventListener("mousemove", lookAround);
		addEventListener("keydown", pressKeys);
		addEventListener("keyup", releaseKeys);
	} else {
		removeEventListener("mousemove", lookAround);
		removeEventListener("keydown", pressKeys);
		removeEventListener("keyup", releaseKeys);

		keys.clear();
	}
});