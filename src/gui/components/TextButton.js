import {Component} from "./Component.js";
import {TextBuffer} from "../buffers/index.js";
import {IMAGES} from "../../../public/constants.js";
import {Font, Lang} from "../index.js";

const
	INITIAL_WIDTH = 200,
	HEIGHT = 20,
	UV = {
		DISABLED: [0, 46],
		NORMAL: [0, 66],
		HOVERED: [0, 86],
	};

/**
 * TextButton component.
 * NOTE: The button width should not exceed 396u.
 * 
 * @constructor
 * @param	{number}	[width=INITIAL_WIDTH]
 * @param	{string}	text
 * @param	{string}	[color="white"]
 * @param	{boolean}	[disabled=false]
 */
export function TextButton({width = INITIAL_WIDTH, text, color = "white", disabled = false}) {
	Component.call(this, ...arguments);

	Object.assign(this, {
		size: [width, HEIGHT],
		halfWidth: width / 2,
		texture: TEXTURES["gui/widgets.png"],
		text,
		color,
		hovered: false,
		disabled,
	});

	// Since the content cannot be changed, it can be computed once
	{
		// Retrieve the button text from the lang data and convert it to a string
		const text = Lang[this.text] + [];

		let chars = text.replaceAll("\n", " ").split(""),
			w = 0,
			h = Font.symbolHeight,
			i;
		this.chars = [];

		for (const c of chars) {
			i = Font.symbols[c] && c;

			// Store the character data
			this.chars.push({
				symbol: i,
				x: w,
			});

			w += Font.symbols[i].width + Font.letterSpacing;
		}

		// Inner size (text)
		this.textSize = [w, h];

		this.textOffset = [
			Math.ceil((this.size[0] - this.textSize[0]) / 2),
			(this.size[1] - this.textSize[1]) / 2,
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
			{x, y, texture} = this,
			[tx, ty] = this.textOffset,
			[tw, th] = this.textSize,
			hw = this.halfWidth,
			h = this.size[1],
			uv = this.disabled ? UV.DISABLED : UV.NORMAL;
		let symbol;

		TextBuffer.resize(tw, th);

		// Draw the button texture
		{
			ctx.drawImage(
				texture,
				...uv,
				hw, h,
				x, y,
				hw, h,
			);
	
			ctx.drawImage(
				texture,
				INITIAL_WIDTH - hw, uv[1],
				hw, h,
				x + hw, y,
				hw, h,
			);
		}

		// Draw the button text
		{
			for (const c of this.chars) {
				symbol = symbols[c.symbol];
	
				bctx.drawImage(
					TEXTURES["font/ascii.png"],
					...symbol.uv,
					symbol.width,
					symbolHeight,
					c.x,
					0,
					symbol.width,
					symbolHeight,
				);
			}

			if (this.color) {
				bctx.globalCompositeOperation = "source-atop";
				bctx.fillStyle = this.color.background;
				bctx.fillRect(0, 0, tw, th);
			}

			ctx.drawImage(TextBuffer, x + tx + 1, y + ty + 1);

			bctx.fillStyle = this.color.foreground;
			bctx.fillRect(0, 0, tw, th);

			ctx.drawImage(TextBuffer, x + tx, y + ty);
		}
	};

	this.hover = ctx => {
		const
			{bctx} = TextBuffer,
			{symbols, symbolHeight} = Font,
			{x, y, texture} = this,
			[tx, ty] = this.textOffset,
			[tw, th] = this.textSize,
			hw = this.halfWidth,
			h = this.size[1],
			uv = this.disabled ? UV.DISABLED : UV.HOVERED;
		let symbol;

		TextBuffer.resize(tw, th);

		// Draw the button texture
		{
			ctx.drawImage(
				texture,
				...uv,
				hw, h,
				x, y,
				hw, h,
			);

			ctx.drawImage(
				texture,
				INITIAL_WIDTH - hw, uv[1],
				hw, h,
				x + hw, y,
				hw, h,
			);
		}

		// Draw the button text
		{
			for (const c of this.chars) {
				symbol = symbols[c.symbol];
	
				bctx.drawImage(
					TEXTURES["font/ascii.png"],
					...symbol.uv,
					symbol.width,
					symbolHeight,
					c.x,
					0,
					symbol.width,
					symbolHeight,
				);
			}

			if (this.color) {
				bctx.globalCompositeOperation = "source-atop";
				bctx.fillStyle = this.color.background;
				bctx.fillRect(0, 0, tw, th);
			}

			ctx.drawImage(TextBuffer, x + tx + 1, y + ty + 1);

			bctx.fillStyle = this.color.foreground;
			bctx.fillRect(0, 0, tw, th);

			ctx.drawImage(TextBuffer, x + tx, y + ty);
		}
	};

	this.unhover = ctx => {
		const
			{x, y} = this,
			[w, h] = this.size;

		ctx.clearRect(x, y, w, h);
	};
};