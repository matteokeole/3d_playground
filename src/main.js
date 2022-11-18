import {keys, TEXTURES, WINDOW} from "./constants.js";
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
	scene = new Scene({background: new Color(0x202124)}),
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
			TEXTURES["crafting_table_front.png"],	// Front
			TEXTURES["crafting_table_front.png"],	// Back
			TEXTURES["crafting_table_side.png"],	// Left
			TEXTURES["crafting_table_side.png"],	// Right
			TEXTURES["crafting_table_top.png"],		// Top
			TEXTURES["crafting_table_top.png"],		// Bottom
		],*/
	}),
);

mesh.position = new Vector3(0, 0, 2);

scene.add(mesh);

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

await Renderer.init();

loop.start();