import {Scene} from "../index.js";
import {Vector4} from "../math/index.js";

/**
 * @abstract
 */
export class Renderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @type {Scene}
	 */
	_scene;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this._canvas = canvas;
		this._scene = null;
	}

	getCanvas() {
		return this._canvas;
	}

	getScene() {
		return this._scene;
	}

	/**
	 * @abstract
	 */
	async build() {}

	/**
	 * @abstract
	 * @param {Vector4} viewport
	 */
	resize(viewport) {}

	/**
	 * @abstract
	 */
	dispose() {}
}