import {Vector2} from "../../src/math/index.js";
import {Renderer} from "../../src/Renderer/index.js";

const movement = new Vector2();

const keyVelocities = {
	KeyW: 1,
	KeyA: -1,
	KeyS: -1,
	KeyD: 1,
	Space: 1,
	ControlLeft: -1,
};

export const keys = {
	KeyW: 0,
	KeyA: 0,
	KeyS: 0,
	KeyD: 0,
	Space: 0,
	ControlLeft: 0,
};

/**
 * @param {Renderer} renderer
 */
export function listen(renderer) {
	function keydown(event) {
		event.preventDefault();

		keys[event.code] = keyVelocities[event.code];
	}

	function keyup(event) {
		event.preventDefault();

		keys[event.code] = 0;
	}

	function mousemove(event) {
		movement[0] = event.movementX;
		movement[1] = event.movementY;

		renderer.getCamera().lookAt(movement);
	}

	document.addEventListener("click", function(event) {
		if (event.target !== renderer.getCanvas()) {
			return;
		}

		renderer.getCanvas().requestPointerLock();
	});

	// `window.addEventListener("pointerlockchange")` doesn't fire in some browsers
	document.addEventListener("pointerlockchange", function() {
		const listener = renderer.getCanvas() === document.pointerLockElement ?
			document.addEventListener :
			document.removeEventListener;

		listener("keydown", keydown);
		listener("keyup", keyup);
		listener("mousemove", mousemove);
	});

	document.addEventListener("resize", function() {
		const viewport = new Vector2(innerWidth, innerHeight);

		renderer.getCamera().aspectRatio = viewport[0] / viewport[1];
		renderer.getCamera().update();

		renderer.getViewport().set(viewport, 2);
		renderer.resize();
	});
}