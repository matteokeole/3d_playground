import {Group} from "../Group.js";
import {intersect} from "../../utils/index.js";
import {GUI} from "../../../public/constants.js";

/**
 * Global layer.
 * 
 * @constructor
 * @param	{string}	name				Layer name (must be unique)
 * @param	{boolean}	[background=false]	Indicates whether the layer has a background pattern preset (in reflection)
 * @param	{array}		[components=[]]		Component list
 */
export function Layer({name, background = false, components = []}) {
	this.width = GUI.screenWidth;
	this.height = GUI.screenHeight;
	this.name = name;
	this.background = background;
	this.components = new Set();
	this.hoverableComponents = new Set();
	this.clickableComponents = new Map();

	const canvas = new OffscreenCanvas(this.width, this.height);
	/*canvas.addEventListener("mousemove", e => {
		const scale = GUI.scale.desired;
		let component, x, y, w, h, hovered;

		for (component of this.hoverableComponents) {
			({x, y} = component);
			[w, h] = component.size;
			hovered = intersect([e.x, e.y], [x, y, w, h]);
			
			if (component.hovered !== hovered) {
				component.hovered = hovered;

				HoverLayer[hoverStates[+component.hovered]](component);
			}
		}
	});*/

	/**
	 * Click (mousedown) layer event.
	 * NOTE: This event uses the `hovered` property, which may not be manually updated.
	 */
	canvas.addEventListener("mousedown", e => {
		let component, callback;

		for ([component, callback] of this.clickableComponents) {
			component.hovered && callback();
		}
	});

	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.setTransform(GUI.scale.desired, 0, 0, GUI.scale.desired, 0, 0);

	this.canvas = canvas;
	this.ctx = ctx;

	this.stretch = (width = GUI.width, height = GUI.height) => {
		this.width = width;
		this.height = height;

		return this;
	};

	this.add = (...components) => {
		for (const component of components) {
			this.components.add(component);

			component.layer = this;
		}

		return this;
	};

	this.remove = (...components) => {
		for (const component of components) {
			this.components.delete(component);
			this.hoverableComponents.delete(component);
			this.clickableComponents.delete(component);

			component.layer = null;
		}

		return this;
	};

	/**
	 * Returns the first component found with the given name.
	 * 
	 * @param	{string}	name
	 * @returns	{Component}
	 */
	this.get = name => [...this.components].find(c => c.name === name);

	this.compute = () => {
		for (const component of this.components) {
			component.visible && component.compute();
		}

		return this;
	};

	this.erase = () => {
		const {ctx} = this;
		let x, y, w, h;

		for (const component of this.components) {
			if (component instanceof Group) {
				component.erase(ctx);

				continue;
			}

			if (component.visible) {
				({x, y} = component);
				[w, h] = component.size;

				ctx.clearRect(x, y, w, h);
			}
		}

		return this;
	};

	this.draw = () => {
		for (const component of this.components) {
			component.visible && component.draw(this.ctx);
		}

		return this;
	};

	GUI.layers[this.name] = this;

	this.add(...components);
};

const hoverStates = ["clearHovered", "drawHovered"];