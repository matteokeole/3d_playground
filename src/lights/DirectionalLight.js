import {Light} from "./Light.js";

export function DirectionalLight(direction, color, intensity) {
	Light.call(this, color, intensity);

	this.direction = direction;
}