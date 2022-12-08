import {Vector2} from "../src/math/index.js";
import {GUI} from "../src/gui/index.js";
import {Crosshair} from "../src/gui/Crosshair.js";
import {Compositor} from "../src/Compositor.js";
import {Renderer} from "../src/Renderer.js";
import {TEXTURES} from "./constants.js";

export function initGUI() {
	// Crosshair test
	const crosshairSize = new Vector2(9, 9);
	const center = new Vector2(innerWidth, innerHeight).divideScalar(2);
	const crosshair = new Crosshair({
		position: center.substract(crosshairSize.divideScalar(2)).toArray(),
		size: crosshairSize.toArray(),
		texture: TEXTURES["gui/widgets.png"],
		uv: [243, 3],
		scale: 1,
	});

	Renderer.bindCrosshair(crosshair);

	const hud = new GUI.Component.Image({
		align: ["center", "center"],
		margin: [0, 0],
		size: [9, 9],
		source: "gui/widgets.png",
		uv: [243, 3],
	});

	const layer = new GUI.Layer({
		name: "hud",
		components: [hud],
	}).compute().draw();

	Compositor.addLayer(layer);
	Compositor.compose();
}