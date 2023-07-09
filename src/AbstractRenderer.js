import {AbstractCamera, AbstractScene} from "./index.js";
import {Vector4} from "./math/index.js";

/** @abstract */
export class AbstractRenderer {
	/**
	 * @private
	 * @type {?HTMLCanvasElement}
	 */
	#canvas = null;

	/**
	 * @private
	 * @type {?WebGL2RenderingContext}
	 */
	#gl = null;

	/**
	 * @private
	 * @type {Vector4}
	 */
	#viewport = new Vector4(0, 0, 300, 150);

	/**
	 * @private
	 * @type {Object.<String, WebGLProgram>}
	 */
	#programs = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLVertexArrayObject>}
	 */
	#vaos = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLBuffer>}
	 */
	#buffers = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	#uniforms = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLTexture>}
	 */
	#textures = {};

	/** @type {?AbstractScene} */
	scene = null;

	/** @type {?AbstractCamera} */
	camera = null;

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

	/** @returns {Vector4} */
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

	/** @returns {Object.<String, WebGLProgram>} */
	get programs() {
		return this.#programs;
	}

	/** @returns {Object.<String, WebGLVertexArrayObject>} */
	get vaos() {
		return this.#vaos;
	}

	/** @returns {Object.<String, WebGLBuffer>} */
	get buffers() {
		return this.#buffers;
	}

	/** @returns {Object.<String, WebGLUniformLocation>} */
	get uniforms() {
		return this.#uniforms;
	}

	/** @returns {Object.<String, WebGLTexture>} */
	get textures() {
		return this.#textures;
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

	/** @param {String[]} paths */
	async loadTextures(basePath, paths) {
		const gl = this.gl;

		for (let i = 0, l = paths.length, path, image, texture; i < l; i++) {
			path = paths[i];
			image = new Image();
			image.src = `${basePath}${path}`;

			try {
				await image.decode();
			} catch (error) {
				continue;
			}

			gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);

			this.#textures[path] = texture;
		}
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

	/** @abstract */
	render() {}
}