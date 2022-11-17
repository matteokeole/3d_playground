import update from "./update.js";
import render from "./render.js";

export default {
	start: loop,
	stop: () => cancelAnimationFrame(request),
};

let request;

function loop() {
	request = requestAnimationFrame(loop);

	update();
	render();
}