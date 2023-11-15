import {AbstractCamera, Scene} from "../index.js";
import {Renderer} from "./Renderer.js";

export class WebGLRenderer extends Renderer {
	/**
	 * @type {?WebGL2RenderingContext}
	 */
	_context;

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
	 * @type {Object.<String, WebGLTexture>}
	 */
	_textures;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);

		this._programs = {};
		this._vaos = {};
		this._buffers = {};
		this._uniforms = {};
		this._textures = {};
	}

	getTextures() {
		return this._textures;
	}

	/**
	 * @throws {Error} if WebGL2 is not supported
	 */
	build() {
		this._context = this._canvas.getContext("webgl2");

		if (this._context === null) {
			throw new Error("This browser doesn't support WebGL2.");
		}

		const gl = this._context;

		this._buffers.scene = gl.createBuffer();
	}

	/**
	 * Note: Must be called after `build`
	 * 
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;

		const gl = this._context;

		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.scene);

		/**
		 * @todo DYNAMIC_DRAW
		 */
	}

	/**
	 * @param {AbstractCamera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	/**
	 * @param {import("../Loader/TextureLoader.js").TextureDescriptor} descriptor
	 */
	addTexture(descriptor) {
		const texture = this._createTexture(descriptor.image);

		this._textures[descriptor.path] = texture;
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
		this._context.getExtension("WEBGL_lose_context").loseContext();

		this._canvas.remove();
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
	 * @param {HTMLImageElement} image
	 * @returns {WebGLTexture}
	 */
	_createTexture(image) {
		const texture = this._context.createTexture();

		this._context.bindTexture(this._context.TEXTURE_2D, texture);

		return texture;
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