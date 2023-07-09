import {Vector2} from "../src/math/index.js";
import {keys} from "./constants.js";

const movement = new Vector2();

export function listen(renderer) {
	const keydown = event => keys.add(event.code);
	const keyup = event => keys.delete(event.code);

	function mousemove(event) {
		movement[0] = event.movementX;
		movement[1] = event.movementY;

		renderer.camera.lookAt(movement);
	}

	addEventListener("click", function(event) {
		if (event.target !== renderer.canvas) return;

		renderer.lock();
	});

	document.addEventListener("pointerlockchange", function() {
		const listener = renderer.locked ? addEventListener : removeEventListener;

		listener("keydown", keydown);
		listener("keyup", keyup);
		listener("mousemove", mousemove);
	});	
}