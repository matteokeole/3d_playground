import {Component} from "./Component.js";
import {IMAGES} from "../../../public/constants.js";

/**
 * Image component.
 * 
 * @constructor
 * @param {array} size Width & height
 * @param {string} [source] Image path (must be loaded before draw)
 * @param {array} uv Image UV
 * @param {number} [scale=1] Scale multiplier
 */
export function Image({size, source, uv, scale = 1}) {
	Component.call(this, ...arguments);

	this.size = size;
	this.source = source;
	this.uv = uv;
	this.scale = scale;

	this.compute = this.computePosition;

	this.draw = function(ctx) {
		const texture = IMAGES[this.source];

		if (!texture) return;

		const
			{x, y, scale} = this,
			[w, h] = this.size,
			[u, v] = this.uv;

		ctx.drawImage(
			texture,
			u, v,
			w / scale, h / scale,
			x, y,
			w, h,
		);
	}
}