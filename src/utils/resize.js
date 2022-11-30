import {Instance, HoverLayer, splash} from "../index.js";

/**
 * @todo
 * 
 * Stretches the layers to the GUI size and scales them.
 * 
 * On resize:
 * - All the currently hovered components are cleared on the HoverLayer
 */
export function resize() {
	const {gui, window} = Instance;

	window.width = Math.ceil(innerWidth / 2) * 2;
	window.height = Math.ceil(innerHeight / 2) * 2;
	gui.scale = gui.preferred_scale;

	// Calculate the new scale
	let i = gui.preferred_scale + 2;
	while (--i > 1) {
		if (
			window.width <= window.default_width * i ||
			window.height < window.default_height * i
		) gui.scale = i - 1;
	}
	i = undefined;

	// Erase the hovered components
	HoverLayer.clearAllHovered();

	const layers = Object.values(gui.layers);

	for (const layer of layers) {
		layer.stretch().erase();
	}

	if (gui.previous_scale !== gui.scale) {
		gui.previous_scale = gui.scale;

		const transform = [gui.scale, 0, 0, gui.scale, 0, 0];

		HoverLayer.ctx.setTransform(...transform);
		splash.ctx.setTransform(...transform);
		for (const layer of layers) {
			layer.ctx.setTransform(...transform);
		}
	}

	for (const layer of layers) {
		layer.compute().draw();
	}
};