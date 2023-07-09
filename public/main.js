import {Vector2, Vector4} from "../src/math/index.js";
import {FIELD_OF_VIEW, FRAMES_PER_SECOND} from "./constants.js";
import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";
import {Scene} from "./Scene.js";
import {build} from "./build.js";
import {listen} from "./events.js";
import {update} from "./update.js";

const viewport = new Vector2(innerWidth, innerHeight);

const renderer = new Renderer();
renderer.viewport = new Vector4(0, 0, viewport[0], viewport[1]);
await renderer.build();

const paths = await (await fetch("assets/textures/textures.json")).json();
await renderer.loadTextures("assets/textures/", paths);

document.body.appendChild(renderer.canvas);

const scene = new Scene();
scene.background = new Vector4(.1, .1, .1, 1);

const camera = new Camera();
camera.fieldOfView = FIELD_OF_VIEW;
camera.aspectRatio = viewport[0] / viewport[1];
camera.near = .01;
camera.far = 1000;
camera.bias = .5;
camera.turnVelocity = .001;

renderer.scene = scene;
renderer.camera = camera;

build(renderer);
listen(renderer);

renderer.framesPerSecond = FRAMES_PER_SECOND;
renderer.update = update;
renderer.loop();