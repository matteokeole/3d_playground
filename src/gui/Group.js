// import {Instance} from "../index.js";
// import {log} from "../utils/index.js";
import {GUI} from "../../public/constants.js";

/**
 * @constructor
 * @param	{string}	name
 * @param	{boolean}	[visible=true]	Determines the group visibility state
 * @param	{array}		align			Horizontal & vertical alignment
 * @param	{array}		[margin=[0, 0]]	Offset relative to the window side
 * @param	{array}		size			Width & height
 * @param	{array}		[components=[]]	Component list
 */
export function Group({name, visible = true, align, margin = [0, 0], size, components = []}) {
	/*if (
		typeof align !== "object" ||
		align.length !== 2 ||
		!["left", "center", "right"].includes(align[0]) ||
		!["top", "center", "bottom"].includes(align[1])
	) return log("system.error.group.invalid_alignment");*/

	Object.assign(this, {
		name,
		visible,
		align,
		margin,
		size,
		components: new Set(),
	});

	/**
	 * Calculates the absolute group position from its alignment/margin.
	 */
	this.computePosition = () => {
		const {layer} = this;

		// if (!layer) return log("system.error.group.unlayered");

		const scale = GUI.scale.current;
		let [horizontal, vertical] = this.align,
			[x, y] = this.margin,
			w = layer.width / scale - this.size[0],
			h = layer.height / scale - this.size[1];

		if (horizontal === "right") x = w - x;
		else if (horizontal === "center") x += w / 2;

		if (vertical === "bottom") y = h - y;
		else if (vertical === "center") y += h / 2;

		this.x = Math.floor(x);
		this.y = Math.floor(y);
	};

	/**
	 * Adds component(s) to the group.
	 * 
	 * @param	{...Component}	components	Component(s) to be added
	 * @return	{self}
	 */
	this.add = (...components) => {
		for (const component of components) {
			this.components.add(component);

			component.group = this;
		}

		return this;
	};

	/**
	 * Removes component(s) to the group.
	 * 
	 * @param	{...Component}	components	Component(s) to be removed
	 * @return	{self}
	 */
	this.remove = (...components) => {
		for (const component of components) {
			this.components.delete(component);

			// Update the inverse side
			component.group = null;
		}

		return this;
	};

	/**
	 * Returns the first component found with the given name.
	 * 
	 * @param	{string}	name
	 * @return	{Component}
	 */
	this.get = name => [...this.components].find(c => c.name === name);

	/**
	 * Computes the component(s) of the group.
	 * 
	 * @return	{self}
	 */
	this.compute = () => {
		if (!this.visible) return;

		this.computePosition();

		for (const component of this.components) {
			component.visible && component.compute();
		}

		return this;
	};

	/**
	 * Draws the component(s) of the group on the layer.
	 * 
	 * @param	{CanvasRenderingContext2D}	ctx	Layer context
	 * @return	{self}
	 */
	this.draw = ctx => {
		if (!this.visible) return;

		for (const component of this.components) {
			component.visible && component.draw(ctx);
		}

		return this;
	};

	/**
	 * Erases the component(s) of the group on the layer.
	 * 
	 * @param	{CanvasRenderingContext2D}	ctx	Layer context
	 * @return	{self}
	 */
	this.erase = ctx => {
		if (!this.visible) return;

		let x, y, w, h;

		for (const component of this.components) {
			if (component.visible) {
				({x, y} = component);
				[w, h] = component.size;

				ctx.clearRect(x, y, w, h);
			}
		}

		return this;
	};

	this.add(...components);
};