import {Layer, Component} from "../src/gui/index.js";
import {Compositor} from "../src/Compositor.js";

export function initGUI() {
	const image = new Component.Image({
		align: ["left", "top"],
		margin: [0, 0],
		size: [40, 40],
		source: "crafting_table_front.png",
		uv: [0, 0],
		// scale: 4
	});

	const layer = new Layer({
		name: "debug",
		components: [image],
	});

	layer.compute().draw();

	Compositor.texture = layer.canvas;
}