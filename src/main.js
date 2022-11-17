import {TEXTURES} from "./constants.js";
import {Renderer} from "./Renderer.js";
import {Scene} from "./Scene.js";
import {Mesh} from "./Mesh.js";
import {Color} from "./Color.js";
import {PerspectiveCamera} from "./cameras/index.js";
import {BoxGeometry} from "./geometries/index.js";
import {Material} from "./materials/index.js";
import {Vector3} from "./math/index.js";
import {loadTextures} from "./utils/index.js";
import loop from "./loop.js";

export const
	keys = new Set(),
	scene = new Scene(),
	camera = new PerspectiveCamera(90, innerWidth / innerHeight, .1, 1000);

await loadTextures(Renderer.gl, [
	// "crafting_table_front.png",
	// "crafting_table_side.png",
	// "crafting_table_top.png",
	"noodles.jpg",
]);

const mesh = new Mesh(
	new BoxGeometry(1, 1, 1),
	new Material({
		textures: [
			TEXTURES["noodles.jpg"],
		],
		/*textures: [
			TEXTURES["crafting_table_front"],	// Front
			TEXTURES["crafting_table_front"],	// Back
			TEXTURES["crafting_table_side"],	// Left
			TEXTURES["crafting_table_side"],	// Right
			TEXTURES["crafting_table_top"],		// Top
			TEXTURES["crafting_table_top"],		// Bottom
		],*/
	}),
);

mesh.position = new Vector3(0, 0, 2);

scene.add(mesh);

addEventListener("click", function() {
	Renderer.canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", pointerLockChange);

function pointerLockChange() {
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
}

function lookAround(e) {
	const {movementX: x, movementY: y} = e;

	camera.lookAround(x, y);
}

function pressKeys(e) {
	keys.add(e.code);
}

function releaseKeys(e) {
	keys.delete(e.code);
}

await Renderer.init();

loop.start();