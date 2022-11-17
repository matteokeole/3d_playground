import {Renderer} from "./Renderer.js";
import {scene, camera} from "./main.js";

export default function() {
	Renderer.render(scene, camera);
};