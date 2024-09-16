import {Camera} from "../Camera/index.js";
import {NotImplementedError} from "../Error/index.js";
import {TextLoader} from "../Loader/index.js";
import {Vector4} from "../math/index.js";
import {Scene} from "../Scene/index.js";
import {Shader} from "../Shader/index.js";

/**
 * @abstract
 */
export class Renderer {
	#textLoader;

	/**
	 * @type {Record.<String, Shader>}
	 */
	_shaders;

	_canvas;
	_viewport;

	/**
	 * @type {?Scene}
	 */
	_scene;

	/**
	 * @type {?Camera}
	 */
	_camera;

	#isPointerLocked;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this.#textLoader = new TextLoader();
		this._shaders = {};

		this._canvas = canvas;
		this._viewport = new Vector4(0, 0, 300, 150);
		this._scene = null;
		this._camera = null;
		this.#isPointerLocked = false;

		document.addEventListener("pointerlockchange", () => {
			const isPointerLocked = document.pointerLockElement === this._canvas;

			this.setIsPointerLocked(isPointerLocked);
		});

		canvas.addEventListener("click", event => {
			if (event.target !== this._canvas) {
				return;
			}

			this._canvas.requestPointerLock();
		});
	}

	getTextLoader() {
		return this.#textLoader;
	}

	/**
	 * @param {String} name
	 */
	getShader(name) {
		if (!(name in this._shaders)) {
			throw new Error(`Could not access non-existing shader "${name}".`);
		}

		return this._shaders[name];
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
	 * @param {Object} scene
	 */
	setScene(scene) {
		this._scene = scene;
	}

	getCamera() {
		return this._camera;
	}

	/**
	 * @abstract
	 * @param {Camera} camera
	 */
	setCamera(camera) {}

	isPointerLocked() {
		return this.#isPointerLocked;
	}

	/**
	 * @param {Boolean} isPointerLocked
	 */
	setIsPointerLocked(isPointerLocked) {
		this.#isPointerLocked = isPointerLocked;
	}

	/**
	 * @abstract
	 */
	async build() {}

	/**
	 * @abstract
	 * 
	 * @overload
	 * @param {String} name
	 * @param {String} sourceUrl
	 * 
	 * @overload
	 * @param {String} name
	 * @param {String} vertexSourceUrl
	 * @param {String} fragmentSourceUrl
	 * 
	 * @overload
	 * @param {String} name
	 * @param {String} commonSourceUrl
	 * @param {String} vertexSourceUrl
	 * @param {String} fragmentSourceUrl
	 */
	async loadShader() {
		throw new NotImplementedError();
	}

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