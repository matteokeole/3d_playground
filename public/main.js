import {FIELD_OF_VIEW} from "./constants.js";
import {Renderer} from "../src/Renderer.js";
import {Scene} from "../src/Scene.js";
import {PerspectiveCamera} from "../src/cameras/index.js";
import {Color} from "../src/Color.js";
import {loadTextures} from "../src/utils/index.js";
import init from "./init.js";
import loop from "./loop.js";

export let scene, camera;

Renderer.build();

scene = new Scene({background: new Color(0x202124)});
camera = new PerspectiveCamera(FIELD_OF_VIEW, innerWidth / innerHeight, .01, 1000, .5);

Renderer.bindCamera(camera);
await Renderer.init();

const textures = await (await fetch("assets/textures/textures.json")).json();
await loadTextures(Renderer.getContext(), textures);

init(scene, camera);

Renderer.prepareRender(scene, camera);
loop.start();