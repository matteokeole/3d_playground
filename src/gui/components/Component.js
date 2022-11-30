import {Group} from "../Group.js";
import {GUI} from "../../../public/constants.js";

/**
 * Global component.
 * 
 * @constructor
 * @param	{string}	name
 * @param	{boolean}	[visible=true]	Visibility state
 * @param	{array}		align			Horizontal & vertical alignment
 * @param	{array}		[margin=[0, 0]]	Offset relative to the window side
 */
export function Component({name, visible = true, align, margin = [0, 0]}) {
	/*if (
		typeof align !== "object" ||
		align.length !== 2 ||
		!["left", "center", "right"].includes(align[0]) ||
		!["top", "center", "bottom"].includes(align[1])
	) return log("system.error.component.invalid_alignment", {
		"%s": this.constructor.name,
	});*/

	this.name = name;
	this.visible = visible;
	this.align = align;
	this.margin = margin;

	/**
	 * Calculates the absolute component position from its alignment/margin.
	 * When finished, the coordinates of the top-left corner will be added as X and Y to the component.
	 */
	this.computePosition = () => {
		const {layer} = this.group ?? this;

		/*if (!layer) return log("system.error.component.unlayered", {
			"%s": this.constructor.name,
		});*/

		let [horizontal, vertical] = this.align,
			[mx, my] = this.margin,
			[w, h] = this.size,
			x, y, ow, oh;

		if (this.group) {
			// Grouped component
			const {group} = this;
			ow = group.size[0];
			oh = group.size[1];

			({x, y} = group);
		} else {
			// Generic component
			const scale = GUI.scale.desired;
			ow = layer.width / scale;
			oh = layer.height / scale;

			x = y = 0;
		}

		ow -= w;
		oh -= h;

		switch (horizontal) {
			case "left":
				x += mx;

				break;
			case "center":
				x += ow / 2 + mx;

				break;
			case "right":
				x += ow - mx;

				break;
		}

		switch (vertical) {
			case "top":
				y += my;

				break;
			case "center":
				y += oh / 2 + my;

				break;
			case "bottom":
				y += oh - my;

				break;
		}

		this.x = Math.floor(x);
		this.y = Math.floor(y);
	};

	/**
	 * Registers the component to its layer event buffer.
	 * 
	 * @param	{string}	event		Event name
	 * @param	{function}	callback	Callback function
	 */
	this.on = (event, callback) => {
		const {layer} = this.group ?? this;

		/*if (!layer) return log("system.error.event_on_unlayered_component", {
			"%s": this.constructor.name,
		});*/

		switch (event) {
			case "hover":
				layer.hoverableComponents.add(this);

				break;
			case "click":
				layer.clickableComponents.set(this, callback);

				break;
		}
	};

	/**
	 * Removes the component from its layer event buffer.
	 * 
	 * @param	{string}	event	Event name
	 */
	this.off = event => {
		const {layer} = this.group ?? this;

		/*if (!layer) return log("system.error.event_on_unlayered_component", {
			"%s": this.constructor.name,
		});*/

		switch (event) {
			case "hover":
				layer.hoverableComponents.delete(this);

				break;
			case "click":
				layer.clickableComponents.delete(this);

				break;
		}
	};
};