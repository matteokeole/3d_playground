import {Component} from "./Component.js";

/**
 * Progress component.
 * 
 * @constructor
 * @param	{number}	length		Inner length, excluding the horizontal padding
 * @param	{number}	[percent=0]	Percentage value
 */
export function Progress({length, percent = 0}) {
	// if (!length) return log("system.error.invalid_progress_length");
	// if (typeof percent !== "number") return log("system.error.invalid_progress_percent");
	// if (percent < 0 || percent > 100) return log("system.error.out_of_range_progress_percent");

	Component.call(this, ...arguments);

	Object.assign(this, {length, percent, size: [length + 4, 10]});

	this.compute = this.computePosition;

	this.draw = ctx => {
		const
			{x, y, length, percent} = this,
			[w, h] = this.size;

		ctx.fillStyle = "#fff";
		ctx.fillRect(x, y, w, h);
		ctx.clearRect(x + 1, y + 1, w - 2, h - 2);
		ctx.fillRect(x + 2, y + 2, length * (percent / 100), h - 4);
	};

	this.advance = step => {
		const
			{ctx} = this.layer,
			{x, y, length, percent} = this,
			[w, h] = this.size,
			rect = [
				x + 2 + length * (percent / 100),
				y + 2,
				length * (step / 100),
				h - 4,
			];

		if (step > 0) {
			ctx.fillStyle = "#fff";
			ctx.fillRect(...rect);
		} else ctx.clearRect(...rect);

		this.percent += step;
	};
};