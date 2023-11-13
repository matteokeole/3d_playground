import {Vector2} from "../../src/math/index.js";

const movement = new Vector2();

export const keys = new Set();
export const Keybind = {
	forward: "KeyW",
	backward: "KeyS",
	left: "KeyA",
	right: "KeyD",
	up: "Space",
	down: "ControlLeft",
};
export function listen(renderer) {
	const keydown = event => keys.add(event.code);
	const keyup = event => keys.delete(event.code);

	function mousemove(event) {
		movement[0] = event.movementX;
		movement[1] = event.movementY;

		renderer.camera.lookAt(movement);
	}

	addEventListener("click", function(event) {
		if (event.target !== renderer.getCanvas()) return;

		renderer.getCanvas().requestPointerLock();
	});

	document.addEventListener("pointerlockchange", function() {
		const listener = renderer.getCanvas() === document.pointerLockElement ? addEventListener : removeEventListener;

		listener("keydown", keydown);
		listener("keyup", keyup);
		listener("mousemove", mousemove);
	});	
}