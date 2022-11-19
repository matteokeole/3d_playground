import {camera} from "./main.js";
import {Keybind, keys} from "./constants.js";

const VELOCITY = .01;
const VELOCITY_SQRT = VELOCITY * Math.SQRT1_2;

export default function() {
	// Cancel diagonal speed boost
	const v = diagonalMovement() ? VELOCITY_SQRT : VELOCITY;

	if (keys.has(Keybind.forward)) camera.moveZ(v);
	if (keys.has(Keybind.backward)) camera.moveZ(-v);
	if (keys.has(Keybind.left)) camera.moveX(-v);
	if (keys.has(Keybind.right)) camera.moveX(v);
	if (keys.has(Keybind.up)) camera.moveY(v);
	if (keys.has(Keybind.down)) camera.moveY(-v);
};

const diagonalMovement = () =>
	(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
	(keys.has(Keybind.left) || keys.has(Keybind.right));