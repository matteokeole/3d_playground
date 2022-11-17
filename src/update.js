import {camera, keys} from "./main.js";
import {Keybind} from "./constants.js";

const VELOCITY = .02;
let v;

export default function() {
	let v = VELOCITY;

	// Cancel diagonal speed boost
	if (
		(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
		(keys.has(Keybind.left) || keys.has(Keybind.right))
	) v *= Math.SQRT1_2;

	if (keys.has(Keybind.forward)) camera.moveZ(v);
	if (keys.has(Keybind.backward)) camera.moveZ(-v);
	if (keys.has(Keybind.left)) camera.moveX(-v);
	if (keys.has(Keybind.right)) camera.moveX(v);
	if (keys.has(Keybind.up)) camera.moveY(v);
	if (keys.has(Keybind.down)) camera.moveY(-v);
};