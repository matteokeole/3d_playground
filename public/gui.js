import {GUI} from "../src/gui/index.js";
import {Compositor} from "../src/Compositor.js";

export function initGUI() {
	const crosshair = new GUI.Component.Image({
		align: ["center", "center"],
		margin: [0, 0],
		size: [9, 9],
		source: "gui/widgets.png",
		uv: [243, 3],
	});

	const layer = new GUI.Layer({
		name: "hud",
		components: [crosshair],
	}).compute().draw();

	Compositor.addLayer(layer);
	Compositor.compose();
}