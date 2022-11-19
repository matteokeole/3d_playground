import {keys, WINDOW} from "./constants.js";
import {Renderer} from "./Renderer.js";
import {Scene} from "./Scene.js";
import {Color} from "./Color.js";
import {PerspectiveCamera} from "./cameras/index.js";
import {loadTextures} from "./utils/index.js";
import init from "./init.js";
import loop from "./loop.js";

export const
	scene = new Scene({background: new Color(0x202124)}),
	camera = new PerspectiveCamera(90, innerWidth / innerHeight, .01, 100);

await Renderer.init();
await loadTextures(Renderer.gl, ["noodles.jpg"]);

init(scene);

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

addEventListener("resize", function() {
	WINDOW.width = innerWidth;
	WINDOW.height = innerHeight;

	Renderer.resize();
	camera.aspect = Renderer.canvas.clientWidth / Renderer.canvas.clientHeight;
	camera.updateProjectionMatrix();
	Renderer.viewport();
});

const lookAround = ({movementX: x, movementY: y}) => camera.lookAround(x, y);
const pressKeys = ({code}) => keys.add(code);
const releaseKeys = ({code}) => keys.delete(code);

loop.start();