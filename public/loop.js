import {Renderer} from "../src/Renderer.js";
import {FRAMES_PER_SECOND} from "./constants.js";
import update from "./update.js";

const FPS_LOOKUPS = [];
let interval, then, now, counter, counterThen, counterDiff, diff, delta, currentFrame, currentRealFrame, request;
let scene, camera;
let FPS_AVERAGE = 0;
let FPS_MAX = 0;

export default {
	start: (_scene, _camera) => {
		scene = _scene;
		camera = _camera;
		currentFrame = currentRealFrame = 0;
		interval = 1000 / FRAMES_PER_SECOND;
		delta = 30 / FRAMES_PER_SECOND;
		then = performance.now();

		counter = counterThen = counterDiff = 0;

		loop();
	},
	stop: () => cancelAnimationFrame(request),
};

function loop() {
	request = requestAnimationFrame(loop);

	counter = now = performance.now();
	diff = now - then;

	counterDiff = counter - counterThen;

	if (currentRealFrame === 0 || diff > interval) {
		then = now - diff % interval;

		currentFrame++;
		currentRealFrame++;

		update(camera, delta);
		Renderer.render(scene, camera);
	}

	if (counterDiff > 1000) {
		debugDelta.textContent = delta.toFixed(2);

		if (FPS_MAX < currentFrame) FPS_MAX = currentFrame;
		debugFpsMax.textContent = FPS_MAX;

		debugFps.textContent = currentFrame;

		FPS_LOOKUPS.push(currentFrame);
		FPS_AVERAGE = FPS_LOOKUPS.reduce((a, b) => a + b) / FPS_LOOKUPS.length;
		debugFpsAvg.textContent = FPS_AVERAGE.toFixed();
		debugElapsed.textContent = `${(now / 1000).toFixed()}s`;

		currentFrame = 0;
		counterThen = performance.now();
	}
};