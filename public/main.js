import {PerspectiveCamera} from "../src/cameras/index.js";
import {Vector2, Vector4} from "../src/math/index.js";
import {FIELD_OF_VIEW} from "./constants.js";
import {Renderer} from "./Renderer.js";
import {Scene} from "./Scene.js";
import init from "./init.js";
// import loop from "./loop.js";

const viewport = new Vector2(innerWidth, innerHeight);

const renderer = new Renderer();
renderer.viewport = new Vector4(0, 0, viewport[0], viewport[1]);
await renderer.build();

const paths = await (await fetch("assets/textures/textures.json")).json();
await renderer.loadTextures("assets/textures/", paths);

document.body.appendChild(renderer.canvas);

const scene = new Scene();
scene.background = new Vector4(0, 0, 0, 1);

const camera = new PerspectiveCamera(FIELD_OF_VIEW, viewport[0] / viewport[1], .01, 1000, .5);
/* const camera = new Camera();
camera.fieldOfView = 90;
camera.aspectRatio = renderer.viewport[2] / renderer.viewport[3];
camera.near = .01;
camera.far = 1000;
camera.bias = PI * .545;
camera.build();
camera.position = new Vector3(0, 0, 0); */

init(scene, camera, renderer.textures);

renderer.scene = scene;
renderer.camera = camera;
renderer.render();

// Renderer.prepareRender(scene, camera);
// Renderer.render(scene, camera);
// loop.start(renderer, scene, camera);