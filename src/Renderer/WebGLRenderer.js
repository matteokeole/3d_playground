import {Renderer} from "./index.js";

export class WebGLRenderer extends Renderer {
	/**
	 * @type {?WebGL2RenderingContext}
	 */
	_context;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);
	}

	/**
	 * @throws {Error} if WebGL2 is not supported
	 */
	async build() {
		this._context = this._canvas.getContext("webgl2");

		if (this._context === null) {
			throw new Error("This browser doesn't support WebGL2.");
		}
	}

	resize(viewport) {
		this._canvas.width = viewport[2];
		this._canvas.height = viewport[3];

		this._context.viewport(
			viewport[0],
			viewport[1],
			viewport[2],
			viewport[3],
		);
	}

	dispose() {
		this._scene = null;

		this._context.getExtension("WEBGL_lose_context").loseContext();
		this._context = null;

		this._canvas.remove();
		this._canvas = null;
	}
}