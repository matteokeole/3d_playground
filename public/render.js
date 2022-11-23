import {scene, camera} from "./main.js";
import {Renderer} from "../src/Renderer.js";

export default function() {
	Renderer.render(scene, camera);
};