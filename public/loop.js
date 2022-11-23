import {FRAMES_PER_SECOND} from "./constants.js";
import update from "./update.js";
import render from "./render.js";

export default {
	start: () => {
		currentFrame = currentRealFrame = 0;
		interval = 1000 / FRAMES_PER_SECOND;
		then = performance.now();

		counter = counterThen = counterDiff = 0;

		loop();
	},
	stop: () => cancelAnimationFrame(request),
};

const fpsSpan = document.querySelector("#fps");
const fpsMaxSpan = document.querySelector("#fps-max");
const fpsAvgSpan = document.querySelector("#fps-avg");
const timerSpan = document.querySelector("#timer");
const FPS_LOOKUPS = [];
let interval, then, now, counter, counterThen, counterDiff, diff, currentFrame, currentRealFrame, request;
let FPS_AVERAGE = 0;
let FPS_MAX = 0;

function loop() {
	request = requestAnimationFrame(loop);

	counter = now = performance.now();
	diff = now - then;

	counterDiff = counter - counterThen;

	if (currentRealFrame === 0 || diff > interval) {
		then = now - diff % interval;

		currentFrame++;
		currentRealFrame++;

		update();
		render();
	}

	if (counterDiff > 1000) {
		if (FPS_MAX < currentFrame) FPS_MAX = currentFrame;
		fpsMaxSpan.textContent = `Max: ${FPS_MAX}`;

		fpsSpan.textContent = `Curr: ${currentFrame}`;

		FPS_LOOKUPS.push(currentFrame);
		FPS_AVERAGE = FPS_LOOKUPS.reduce((a, b) => a + b) / FPS_LOOKUPS.length;
		fpsAvgSpan.textContent = `Avg: ${FPS_AVERAGE.toFixed()}`;
		timerSpan.textContent = `${(now / 1000).toFixed()}s`;

		currentFrame = 0;
		counterThen = performance.now();
	}
};