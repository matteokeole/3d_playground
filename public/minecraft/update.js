import {VELOCITY, VELOCITY_SQRT1_2, CAMERA_LERP_FACTOR} from "./index.js";
import {Keybind, keys} from "./input.js";

const diagonalMovement = () =>
	(keys.has(Keybind.forward) || keys.has(Keybind.backward)) &&
	(keys.has(Keybind.left) || keys.has(Keybind.right));

export function update(delta, renderer) {
	const {camera} = renderer;
	const velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * delta;

	if (keys.has("KeyW")) camera.moveZ(velocity);
	if (keys.has("KeyS")) camera.moveZ(-velocity);
	if (keys.has("KeyA")) camera.truck(-velocity);
	if (keys.has("KeyD")) camera.truck(velocity);
	if (keys.has("Space")) camera.moveY(velocity);
	if (keys.has("ControlLeft")) camera.moveY(-velocity);

	camera.position.set(camera.target.clone().lerp(camera.position, CAMERA_LERP_FACTOR));
	camera.update();

	DebugDelta.textContent = delta.toFixed(2);
};