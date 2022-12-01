import {GUI} from "../src/gui/index.js";
import {Compositor} from "../src/Compositor.js";

export function initGUI() {
	const image = new GUI.Component.Image({
		align: ["left", "top"],
		margin: [0, 0],
		size: [32, 32],
		source: "crafting_table_top.png",
		uv: [0, 0],
		scale: 2,
	});

	const layer = new GUI.Layer({
		name: "debug",
		components: [image],
	}).compute().draw();

	Compositor.addLayer(layer);
	Compositor.compose();
}