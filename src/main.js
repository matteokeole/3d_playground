import {Renderer} from "./Renderer.js";
import {Scene} from "./Scene.js";
import {Mesh} from "./Mesh.js";
import {Color} from "./Color.js";
import {PerspectiveCamera} from "./cameras/index.js";
import {BoxGeometry} from "./geometries/index.js";
import {Material} from "./materials/index.js";
import {Vector3} from "./math/index.js";

await Renderer.init();

const scene = new Scene();
const camera = new PerspectiveCamera(90, innerWidth / innerHeight, .1, 1000);
const mesh = new Mesh(
	new BoxGeometry(1, 1, 1),
	new Material({color: new Color(0xff9800)}),
);

mesh.position = new Vector3(0, 0, 2);

scene.add(mesh);

Renderer.render(scene, camera);

addEventListener("click", function() {
	Renderer.canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", pointerLockChange);

function pointerLockChange() {
	if (Renderer.canvas === document.pointerLockElement) {
		addEventListener("mousemove", lookAround);
	} else {
		removeEventListener("mousemove", lookAround);
	}
}

function lookAround(e) {
	const {movementX: x, movementY: y} = e;

	camera.lookAround(x, y);

	Renderer.render(scene, camera);
}