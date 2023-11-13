import {AbstractCamera, AbstractScene, Texture} from "./index.js";
import {Vector4} from "./math/index.js";

/**
 * @deprecated
 * @abstract
 */
export class Renderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	#canvas;

	/**
	 * @type {?WebGL2RenderingContext}
	 */
	_context;

	/**
	 * @type {Vector4}
	 */
	_viewport;

	/**
	 * @type {Object.<String, WebGLProgram>}
	 */
	_programs;

	/**
	 * @type {Object.<String, WebGLVertexArrayObject>}
	 */
	_vaos;

	/**
	 * @type {Object.<String, WebGLBuffer>}
	 */
	_buffers;

	/**
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	_uniforms;

	/**
	 * @type {Object.<String, Texture>}
	 */
	_textures;

	/**
	 * @type {?AbstractScene}
	 */
	scene = null;

	/**
	 * @type {?AbstractCamera}
	 */
	camera = null;

	/**
	 * @type {?Function}
	 */
	update = null;

	/**
	 * @type {Number}
	 */
	#frames = 0;

	/**
	 * @type {?Number}
	 */
	#framesPerSecond = null;

	/**
	 * @type {?Number}
	 */
	#frameInterval = null;

	/**
	 * @type {?Number}
	 */
	#then = null;

	/**
	 * @type {Boolean}
	 */
	debug;

	constructor() {
		this.#canvas = null;
		this._context = null;
		this._viewport = new Vector4(0, 0, 300, 150);
		this._programs = {};
		this._vaos = {};
		this._buffers = {};
		this._uniforms = {};
		this._textures = {};
		this.debug = false;
	}

	getCanvas() {
		return this.#canvas;
	}

	getViewport() {
		return this._viewport;
	}

	/**
	 * @param {Vector4} viewport
	 */
	setViewport(viewport) {
		this._viewport.set(viewport);
	}

	/**
	 * @type {Number}
	 */
	get frames() {
		return this.#frames;
	}

	/**
	 * @returns {?Number}
	 */
	get framesPerSecond() {
		return this.#framesPerSecond;
	}

	/**
	 * @param {Number} framesPerSecond
	 */
	set framesPerSecond(framesPerSecond) {
		this.#framesPerSecond = framesPerSecond;
		this.#frameInterval = framesPerSecond === 0 ? 0 : 1000 / framesPerSecond;
		this.#then = 0;
	}

	/**
	 * Initializes the canvas and its WebGL context.
	 */
	build() {
		this.#canvas = document.createElement("canvas");
		this.#canvas.width = this._viewport[2];
		this.#canvas.height = this._viewport[3];
		this._context = this.#canvas.getContext("webgl2");
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
			if (this._context.getShaderInfoLog(vertexShader) !== "") {
				throw new Error(`VERTEX SHADER ${this._context.getShaderInfoLog(vertexShader)}`);
			}

			if (this._context.getShaderInfoLog(fragmentShader) !== "") {
				throw new Error(`FRAGMENT SHADER ${this._context.getShaderInfoLog(fragmentShader)}`);
			}
		}

		return program;
	}

	/**
	 * @param {import("./Loader/TextureLoader.js").TextureDescriptor} descriptor
	 */
	addTexture(descriptor) {
		const texture = this._context.createTexture();

		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this.setupTexture(descriptor.image);

		this._textures[descriptor.path] = texture;
	}

	/**
	 * @abstract
	 * @param {HTMLImageElement} image
	 */
	setupTexture(image) {}

	resize() {
		this.#canvas.width = this._viewport[2];
		this.#canvas.height = this._viewport[3];

		this._context.viewport(
			this._viewport[0],
			this._viewport[1],
			this._viewport[2],
			this._viewport[3],
		);
	}

	loop() {
		const requestId = requestAnimationFrame(this.loop.bind(this));
		const now = performance.now();
		const delta = now - this.#then;

		if (this.#frames === 0 || delta > this.#frameInterval) {
			this.#then = now - delta / this.#frameInterval;

			try {
				this.update(delta, this);
				this.render();
			} catch (error) {
				console.error(error);

				cancelAnimationFrame(requestId);
			}

			this.#frames++;
		}
	}

	/**
	 * @abstract
	 */
	render() {}

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