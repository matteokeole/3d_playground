import {Component} from "./Component.js";
import {IMAGES} from "../../../public/constants.js";
import {Font} from "../index.js";

/**
 * Rich text component.
 * NOTE: Please avoid using floats for the arguments which require numbers. This can cause color spreading.
 * 
 * @constructor
 * @param	{array}		[padding=[0, 0, 0, 0]]	Padding (the bottom padding is ignored by underlines)
 * @param	{Color}		[background]			Text background color, including the padding
 * @param	{string}	[text=""]				Text string
 * @param	{boolean}	[dropShadow=true]		Text drop-shadow
 * @param	{number}	[fontSize=1]			Font size multiplier
 * @param	{number}	[letterSpacing=1]		Letter spacing value
 * @param	{number}	[lineSpacing=1]			Line spacing value
 * @param	{number}	[boldWeight=1]			Bold weight value (0 means the weight will be regular)
 */
export function RichText({padding = [0, 0, 0, 0], background, text = "", dropShadow = true, fontSize = 1, letterSpacing = 1, lineSpacing = 1, boldWeight = 1}) {
	Component.call(this, ...arguments);

	if (typeof text !== "string") throw "RichText: `text` must be of type string";

	Object.assign(this, {padding, background, text, dropShadow, fontSize, letterSpacing, lineSpacing, boldWeight});

	/**
	 * Formats the text value of the component.
	 */
	this.format = () => {
		let chars = this.text.split(""),
			{symbols} = Font,
			colors = Object.values(Font.colors),
			ch = Font.symbolHeight,
			[pt, pr, pb, pl] = this.padding,
			fs = this.fontSize,
			hs = this.letterSpacing,
			vs = this.lineSpacing,
			bw = this.boldWeight,
			w,
			h,
			x,
			y,
			i,
			cw,
			parsing = {
				formatterPrefix: false,
				colorPrefixFor: false,
				colorValue: false,
			},
			bold = false,
			color,
			highlight,
			strikethrough,
			underline;

		w = h = x = y = 0;
		color = highlight = strikethrough = underline = null;

		this.chars = [];
		this.parts = {
			bold: [],
			color: [],
			highlight: [],
			strikethrough: [],
			underline: [],
		};

		for (const c of chars) {
			// Search for a formatter prefix
			if (c === Font.formatter.prefix) {
				// The next character will be interpreted as a formatter character
				parsing.formatterPrefix = true;

				continue;
			}

			// Formatting operations
			if (parsing.formatterPrefix) {
				parsing.formatterPrefix = false;

				switch (c) {
					case Font.formatter.bold:
						bold = true;

						break;
					case Font.formatter.color:
					case Font.formatter.highlight:
						parsing.colorPrefixFor = c;

						break;
					case Font.formatter.strikethrough:
						strikethrough ??= {
							w: 0,
							x,
							y: y + Font.strikethroughY,
						};

						break;
					case Font.formatter.underline:
						underline ??= {
							w: 0,
							x,
							y: y + Font.underlineY,
						};

						break;
					case Font.formatter.reset:
						bold = false;

						if (color) {
							this.parts.color.push(color);
							color = null;
						}

						if (highlight) {
							this.parts.highlight.push(highlight);
							highlight = null;
						}

						if (strikethrough) {
							this.parts.strikethrough.push(strikethrough);
							strikethrough = null;
						}

						if (underline) {
							this.parts.underline.push(underline);
							underline = null;
						}

						break;
				}

				continue;
			}

			// Color formating operations
			if (parsing.colorPrefixFor && c === "\u003a") {
				parsing.colorValue = true;

				continue;
			}

			if (parsing.colorValue) {
				parsing.colorValue = false;

				i = parseInt(c, 16);

				// Ignore the formatter if the code is invalid
				if (isNaN(i)) continue;

				// Find the color corresponding to the code
				const code = colors.find(color => c === color.code);

				switch (parsing.colorPrefixFor) {
					case Font.formatter.color:
						if (color) this.parts.color.push(color);
						color = {
							w: 0,
							x,
							y,
							color: code,
						};

						break;
					case Font.formatter.highlight:
						if (highlight) this.parts.highlight.push(highlight);
						highlight = {
							w: 0,
							x,
							y,
							color: code,
						};

						break;
				}

				parsing.colorPrefixFor = false;

				continue;
			}

			// Search for a line break
			if (c === "\u000a") {
				w = Math.max(x, w);
				x = 0;
				y += vs + ch;

				// If the color format is on, continue it on the next line
				if (color) {
					this.parts.color.push(color);
					color = {
						w: 0,
						x,
						y,
						color: color.color,
					};
				}

				// If the highlight format is on, continue it on the next line
				if (highlight) {
					this.parts.highlight.push(highlight);
					highlight = {
						w: 0,
						x,
						y,
						color: color.color,
					};
				}

				// If the strikethrough format is on, continue it on the next line
				if (strikethrough) {
					this.parts.strikethrough.push(strikethrough);
					strikethrough = {
						w: 0,
						x,
						y: y + Font.strikethroughY,
					};
				}

				// If the underline format is on, continue it on the next line
				if (underline) {
					this.parts.underline.push(underline);
					underline = {
						w: 0,
						x,
						y: y + Font.underlineY,
					};
				}

				continue;
			}

			i = symbols[c] ? c : undefined;
			cw = symbols[i].width + hs;

			// Push the current character (the symbol allows getting the right UV)
			this.chars.push({
				symbol: i,
				x,
				y,
			});



			// Additional operations for bold characters
			if (bold) {
				// Increase the offset with the next character by the bold weight factor
				// This happens before the other formatters because it determines the final character width
				cw += bw;

				// Store the character index in the bold list
				this.parts.bold.push(this.chars.length - 1);
			}

			// If color formatting, increment the width of the current colorized part
			color && (color.w += cw);

			// If highlight formatting, increment the width of the current highlighted part
			highlight && (highlight.w += cw);

			// If strikethrough formatting, increment the width of the current strikethrough part
			strikethrough && (strikethrough.w += cw);

			// If underline formatting, increment the width of the current underlined part
			underline && (underline.w += cw);

			// Add the character width to the X offset and continue
			x += cw;
		}

		if (color) {
			this.parts.color.push(color);
			color = null;
		}

		if (highlight) {
			this.parts.highlight.push(highlight);
			highlight = null;
		}

		if (strikethrough) {
			this.parts.strikethrough.push(strikethrough);
			strikethrough = null;
		}

		if (underline) {
			this.parts.underline.push(underline);
			underline = null;
		}

		// Inner size (text)
		w = Math.max(x, w);
		h = ch + y;
		this.textSize = [w, h].map(s => s * fs);

		// Full size, including padding
		w += pl + pr;
		h += pt + pb;
		this.size = [w, h].map(s => s * fs);
	};

	this.compute = this.computePosition;

	this.draw = ctx => {
		if (!this.chars?.length) return;

		const
			bw = this.textSize[0] * this.fontSize,
			bh = (this.textSize[1] + 1) * this.fontSize,
			ch = Font.symbolHeight,
			fs = this.fontSize,
			[pt, pr, pb, pl] = this.padding,
			{x, y, chars} = this,
			[w, h] = this.size;
		let buffer, bctx, symbol;

		try {
			buffer = new OffscreenCanvas(bw, bh);
		} catch (e) {
			buffer = document.createElement("canvas");
			buffer.width = bw;
			buffer.height = bh;
		}

		bctx = buffer.getContext("2d");
		bctx.imageSmoothingEnabled = false;

		// Base chars
		for (const char of chars) {
			symbol = Font.symbols[char.symbol];

			bctx.drawImage(
				TEXTURES["font/ascii.png"],
				...symbol.uv,
				symbol.width,
				ch,
				char.x * fs,
				char.y * fs,
				symbol.width * fs,
				ch * fs,
			);
		}

		// Buffer formatting operations
		{
			// Bold
			let char;
			for (const i of this.parts.bold) {
				char = chars[i];
				symbol = Font.symbols[char.symbol];

				for (let weight = 1; weight <= this.boldWeight; weight++) {
					bctx.drawImage(
						TEXTURES["font/ascii.png"],
						...symbol.uv,
						symbol.width,
						ch,
						(char.x + weight) * fs,
						char.y * fs,
						symbol.width * fs,
						ch * fs,
					);
				}
			}

			// Strikethrough
			for (const part of this.parts.strikethrough) {
				bctx.fillStyle = "#fff";
				bctx.fillRect(part.x * fs, part.y * fs, part.w * fs, fs);
			}

			// Underline
			for (const part of this.parts.underline) {
				bctx.fillStyle = "#fff";
				bctx.fillRect(part.x * fs, part.y * fs, part.w * fs, fs);
			}

			// Color
			bctx.globalCompositeOperation = "source-atop";
			for (const part of this.parts.color) {
				bctx.fillStyle = part.color.foreground;
				bctx.fillRect(part.x * fs, part.y * fs, part.w * fs, (ch + 1) * fs);
			}
		}

		// Layer draw
		ctx.drawImage(buffer, x + pl, y + pt);
		ctx.globalCompositeOperation = "destination-over";

		// Post-buffer formatting operations
		{
			// Drop-shadow
			if (this.dropShadow) {
				bctx.fillStyle = Font.colors.white.background;
				bctx.fillRect(0, 0, bw, bh);

				for (const part of this.parts.color) {
					bctx.fillStyle = part.color.background;
					bctx.fillRect(part.x * fs, part.y * fs, part.w * fs, (ch + 1) * fs);
				}

				ctx.drawImage(buffer, x + pl + fs, y + pt + fs);
			}

			// Highlight
			for (const part of this.parts.highlight) {
				ctx.fillStyle = part.color.foreground;
				ctx.fillRect(x + pl + part.x * fs, y + pt + part.y * fs, part.w * fs, ch * fs);
			}
		}

		// Optional background color
		if (this.background) {
			ctx.fillStyle = this.background.hex;
			ctx.fillRect(x, y, w, h);
		}

		// Reset the composite operation value
		ctx.globalCompositeOperation = "source-over";
	};
};