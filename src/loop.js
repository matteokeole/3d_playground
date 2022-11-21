import {FRAMES_PER_SECOND} from "./constants.js";
import update from "./update.js";
import render from "./render.js";

export default {
	start: () => {
		currentFrame = 0;
		interval = 1000 / FRAMES_PER_SECOND;
		start = then = performance.now();

		loop();
	},
	stop: () => cancelAnimationFrame(request),
};

let interval, start, then, now, diff, currentFrame, request;

function loop() {
	request = requestAnimationFrame(loop);

	now = performance.now();
	diff = now - then;

	if (currentFrame === 0 || diff > interval) {
		then = now - diff % interval;

		currentFrame++;

		update();
		render();
	}
};