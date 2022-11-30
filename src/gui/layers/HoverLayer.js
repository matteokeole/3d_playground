import {Instance} from "../../index.js";

export const HoverLayer = {
	canvas: document.createElement("canvas"),
	init: function() {
		this.width = Instance.window.width;
		this.height = Instance.window.height;
		this.canvas.className = "hover";
		this.canvas.width = Instance.window.max_width;
		this.canvas.height = Instance.window.max_height;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.setTransform(Instance.gui.scale, 0, 0, Instance.gui.scale, 0, 0);

		document.body.appendChild(this.canvas);
	},
	hoveredComponents: new Set(),
	drawHovered: function(component) {
		this.hoveredComponents.add(component);

		component.hover(this.ctx);
	},
	clearHovered: function(component) {
		this.hoveredComponents.delete(component);

		component.unhover(this.ctx);
	},
	clearAllHovered: function() {
		for (const component of this.hoveredComponents) {
			component.hovered = false;

			this.clearHovered(component);
		}
	},
};