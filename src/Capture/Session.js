import {Frame} from "./index.js";

export class Session {
	/**
	 * @type {Frame[]}
	 */
	#frames;

	/**
	 * @param {Frame[]} frames 
	 */
	constructor(frames) {
		this.#frames = frames;
	}

	getFrames() {
		return frames;
	}

	/**
	 * @param {Number} index
	 * @returns {?Frame}
	 */
	read(index) {
		return this.#frames[index] ?? null;
	}
}