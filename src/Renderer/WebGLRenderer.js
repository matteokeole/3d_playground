import {Renderer} from "./Renderer.js";

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

	/**
	 * @param {String} vertexShaderSource
	 * @param {String} fragmentShaderSource
	 * @throws {Error} if the program linking was not successful
	 */
	_createProgram(vertexShaderSource, fragmentShaderSource) {
		const program = this._context.createProgram();
		const vertexShader = this.#createShader(this._context.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = this.#createShader(this._context.FRAGMENT_SHADER, fragmentShaderSource);

		this._context.attachShader(program, vertexShader);
		this._context.attachShader(program, fragmentShader);
		this._context.linkProgram(program);

		if (!this._context.getProgramParameter(program, this._context.LINK_STATUS)) {
			if (this._context.getShaderInfoLog(vertexShader).length !== 0) {
				throw new Error(`VERTEX SHADER ${this._context.getShaderInfoLog(vertexShader)}`);
			}

			if (this._context.getShaderInfoLog(fragmentShader).length !== 0) {
				throw new Error(`FRAGMENT SHADER ${this._context.getShaderInfoLog(fragmentShader)}`);
			}
		}

		return program;
	}

	/**
	 * @param {GLint} type
	 * @param {String} source
	 */
	#createShader(type, source) {
		const shader = this._context.createShader(type);

		this._context.shaderSource(shader, source);
		this._context.compileShader(shader);

		return shader;
	}
}