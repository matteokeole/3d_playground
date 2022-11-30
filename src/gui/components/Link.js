import {Component} from "./Component.js";
import {TextBuffer} from "../buffers/index.js";
import {IMAGES} from "../../../public/constants.js";
import {Font} from "../index.js";

/**
 * Link component.
 * 
 * @constructor
 * @param	{array}		[padding=[0, 0, 0, 0]]	Padding
 * @param	{string}	[text=""]				Text string
 * @param	{string}	[color="white"]			Text color (since link text can't be formatted, the whole text will get this color)
 * @param	{number}	[fontSize=1]			Font size multiplier
 */
export function Link({padding = [0, 0, 0, 0], text = "", color = "white", fontSize = 1}) {
	Component.call(this, ...arguments);

	Object.assign(this, {padding, text, color, fontSize, hovered: false});

	// Since the cannot be changed, it can be computed once
	{
		// Multiple lines are not allowed
		let chars = this.text.replaceAll("\n", " ").split(""),
			[pt, pr, pb, pl] = this.padding,
			fs = this.fontSize,
			w = 0,
			h = Font.symbolHeight * fs,
			i;
		this.chars = [];

		for (const c of chars) {
			i = Font.symbols[c] && c;

			// Store the character data
			this.chars.push({
				symbol: i,
				x: w,
			});

			w += (Font.symbols[i].width + Font.letterSpacing) * fs;
		}

		// Inner size (text)
		this.textSize = [w, h];

		// Full size, including padding
		// Width and height have already been scaled by the font size
		this.size = [
			w + (pl + pr) * fs,
			h + (pt + pb) * fs,
		];

		// Retrieve the text color from the color list
		this.color = Font.colors[this.color];
	}

	this.compute = () => {
		this.on("hover");

		this.computePosition();
	};

	this.draw = ctx => {
		const
			{bctx} = TextBuffer,
			{symbols, symbolHeight} = Font,
			{x, y} = this,
			[tw, th] = this.textSize,
			fs = this.fontSize;
		let symbol;

		TextBuffer.resize(tw, th + fs);

		for (const c of this.chars) {
			symbol = symbols[c.symbol];

			bctx.drawImage(
				IMAGES["font/ascii.png"],
				...symbol.uv,
				symbol.width,
				symbolHeight,
				c.x,
				0,
				symbol.width * fs,
				symbolHeight * fs,
			);
		}

		if (this.color) {
			bctx.globalCompositeOperation = "source-atop";
			bctx.fillStyle = this.color.foreground;
			bctx.fillRect(0, 0, tw, th);
		}

		ctx.drawImage(TextBuffer, x, y);

		bctx.fillStyle = this.color.background;
		bctx.fillRect(0, 0, tw, th);

		ctx.globalCompositeOperation = "destination-over";
		ctx.drawImage(TextBuffer, x + fs, y + fs);

		// Reset the composite operation value
		ctx.globalCompositeOperation = "source-over";
	};

	this.hover = ctx => {
		const
			fs = this.fontSize,
			ux = this.x - fs,
			uy = this.y + this.textSize[1],
			uw = this.textSize[0] + fs,
			uh = fs;

		ctx.fillStyle = this.color.foreground;
		ctx.fillRect(ux, uy, uw, uh);

		ctx.fillStyle = this.color.background;
		ctx.fillRect(ux + fs, uy + fs, uw, uh);
	};

	this.unhover = ctx => {
		const
			fs = this.fontSize,
			ux = this.x - fs,
			uy = this.y + this.textSize[1],
			uw = this.textSize[0] + fs,
			uh = fs;

		ctx.clearRect(ux, uy, uw + fs, uh * 2);
	};
};