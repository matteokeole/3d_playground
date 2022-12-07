/**
 * Prototype tests for an instance singleton.
 */
// instance.js //

export function Instance({/* instance options... */}) {
	let FIELD_OF_VIEW,
		FPS_AVERAGE,
		FPS_MAX,
		GUI_DESIRED_SCALE,
		GUI_MAX_SCALE,
		GUI_SCALE,
		VIEWPORT_HEIGHT,
		VIEWPORT_WIDTH;

	this.getFov = () => FIELD_OF_VIEW;
	this.setFov = value => FIELD_OF_VIEW = value;
}



// main.js //

import {Instance} from "instance";

export default new Instance({
	// instance options...
});



// other.js //

import Instance from "main";

function getCurrentFov() {
	return Instance.getFov();
}

function updateFov(fov) {
	Instance.setFov(fov);
}

updateFov(90);