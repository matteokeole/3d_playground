import {Instance, TEXTURES} from "../../index.js";

export const BackgroundLayer = {
	canvas: document.createElement("canvas"),
	init: function() {
		this.resize();
		this.canvas.className = "background";
		this.hide();
		this.canvas.width = Instance.window.max_width;
		this.canvas.height = Instance.window.max_height;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;

		document.body.appendChild(this.canvas);

		return this;
	},
	resize: function() {
		this.width = Instance.window.width;
		this.height = Instance.window.height;

		return this;
	},
	draw: function() {
		this.ctx.setTransform(Instance.gui.scale * 2, 0, 0, Instance.gui.scale * 2, 0, 0);
		this.ctx.filter = "brightness(25%)";
		this.ctx.fillStyle = this.ctx.createPattern(TEXTURES["gui/options_background.png"], "repeat");
		this.ctx.fillRect(0, 0, this.width, this.height);

		return this;
	},
	show: function() {
		this.canvas.style.visibility = "visible";

		return this;
	},
	hide: function() {
		this.canvas.style.visibility = "hidden";

		return this;
	},
}