import {AbstractCamera, Scene} from "../index.js";
import {Vector4} from "../math/index.js";

/**
 * @abstract
 */
export class Renderer {
	/**
	 * @type {HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @type {Vector4}
	 */
	_viewport;

	/**
	 * @type {?Scene}
	 */
	_scene;

	/**
	 * @type {?AbstractCamera}
	 */
	_camera;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this._canvas = canvas;
		this._viewport = new Vector4(0, 0, 300, 150);
		this._scene = null;
	}

	getCanvas() {
		return this._canvas;
	}

	getViewport() {
		return this._viewport;
	}

	/**
	 * @param {Vector4} viewport
	 */
	setViewport(viewport) {
		this._viewport = viewport;
	}

	getScene() {
		return this._scene;
	}

	/**
	 * @abstract
	 * @param {Scene} scene
	 */
	setScene(scene) {}

	getCamera() {
		return this._camera;
	}

	/**
	 * @abstract
	 * @param {AbstractCamera} camera
	 */
	setCamera(camera) {}

	/**
	 * @abstract
	 */
	build() {}

	/**
	 * @abstract
	 */
	render() {}

	/**
	 * @abstract
	 */
	resize() {}

	/**
	 * @abstract
	 */
	dispose() {}
}