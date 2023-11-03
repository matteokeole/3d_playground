import {AbstractCamera, AbstractScene, Texture} from "./index.js";
import {Vector4} from "./math/index.js";

/**
 * @abstract
 */
export class AbstractRenderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	#canvas = null;

	/**
	 * @type {?WebGL2RenderingContext}
	 */
	#gl = null;

	/**
	 * @type {Vector4}
	 */
	#viewport = new Vector4(0, 0, 300, 150);

	/**
	 * @type {Object.<String, WebGLProgram>}
	 */
	#programs = {};

	/**
	 * @type {Object.<String, WebGLVertexArrayObject>}
	 */
	#vaos = {};

	/**
	 * @type {Object.<String, WebGLBuffer>}
	 */
	#buffers = {};

	/**
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	#uniforms = {};

	/**
	 * @type {Object.<String, Texture>}
	 */
	#textures = {};

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
	 * @type {Number}
	 */
	debug = false;

	/**
	 * @returns {HTMLCanvasElement}
	 * @throws {ReferenceError}
	 */
	get canvas() {
		if (this.#canvas === null) throw ReferenceError("canvas is not defined");

		return this.#canvas;
	}

	/**
	 * @returns {WebGL2RenderingContext}
	 * @throws {ReferenceError}
	 */
	get gl() {
		if (this.#gl === null) throw ReferenceError("gl is not defined");

		return this.#gl;
	}

	/**
	 * @returns {Vector4}
	 */
	get viewport() {
		return this.#viewport;
	}

	/**
	 * @param {Vector4} viewport
	 * @returns {AbstractRenderer}
	 */
	set viewport(viewport) {
		this.#viewport.set(viewport);

		return this;
	}

	/**
	 * @returns {Object.<String, WebGLProgram>}
	 */
	get programs() {
		return this.#programs;
	}

	/**
	 * @returns {Object.<String, WebGLVertexArrayObject>}
	 */
	get vaos() {
		return this.#vaos;
	}

	/**
	 * @returns {Object.<String, WebGLBuffer>}
	 */
	get buffers() {
		return this.#buffers;
	}

	/**
	 * @returns {Object.<String, WebGLUniformLocation>}
	 */
	get uniforms() {
		return this.#uniforms;
	}

	/**
	 * @returns {Object.<String, Texture>}
	 */
	get textures() {
		return this.#textures;
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

	get locked() {
		return document.pointerLockElement === this.#canvas;
	}

	/**
	 * @param {Number} framesPerSecond
	 * @returns {AbstractRenderer}
	 */
	set framesPerSecond(framesPerSecond) {
		this.#framesPerSecond = framesPerSecond;
		this.#frameInterval = framesPerSecond === 0 ? 0 : 1000 / framesPerSecond;
		this.#then = 0;

		return this;
	}

	/** Initializes the canvas and its WebGL context. */
	build() {
		const viewport = this.#viewport;
		const canvas = document.createElement("canvas");

		canvas.width = viewport[2];
		canvas.height = viewport[3];

		this.#gl = canvas.getContext("webgl2");
		this.#canvas = canvas;
	}

	/**
	 * Creates a program from the shader sources.
	 * Dumps the program and shader logs if a link error occurs.
	 * 
	 * @param {String} programName
	 * @param {String} vertexShaderSource
	 * @param {String} fragmentShaderSource
	 * @throws {Error}
	 */
	createProgram(programName, vertexShaderSource, fragmentShaderSource) {
		const gl = this.#gl;
		const programs = this.#programs;

		const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const vertexShaderLog = gl.getShaderInfoLog(vertexShader);
			if (vertexShaderLog !== '') console.warn(`Vertex shader log:\n${vertexShaderLog}`);

			const fragmentShaderLog = gl.getShaderInfoLog(fragmentShader);
			if (fragmentShaderLog !== '') console.warn(`Fragment shader log:\n${fragmentShaderLog}`);

			throw Error(gl.getProgramInfoLog(program));
		}

		programs[programName] = program;
	}

	/**
	 * Creates, compiles and returns a shader.
	 * 
	 * @param {GLenum} shaderType
	 * @param {String} shaderSource
	 * @returns {WebGLShader}
	 */
	createShader(shaderType, shaderSource) {
		const gl = this.#gl;

		const shader = gl.createShader(shaderType);
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);

		return shader;
	}

	/**
	 * @param {String[]} paths
	 */
	async loadTextures(basePath, paths) {
		const gl = this.gl;

		for (let i = 0, l = paths.length, path, image, texture; i < l; i++) {
			path = paths[i];
			image = new Image();
			image.src = `${basePath}${path}`;

			try {
				await image.decode();
			} catch (_) {
				continue;
			}

			texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);

			this.setupTexture(image);

			this.#textures[path] = new Texture(texture, image);
		}
	}

	/**
	 * @abstract
	 * @param {Image} image
	 */
	setupTexture(image) {}

	lock() {
		this.#canvas.requestPointerLock();
	}

	resize() {
		const canvas = this.#canvas;
		const gl = this.#gl;
		const viewport = this.#viewport;

		gl.viewport(
			viewport[0],
			viewport[1],
			canvas.width = viewport[2],
			canvas.height = viewport[3],
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
}