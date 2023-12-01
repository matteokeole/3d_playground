import {AbstractCamera, Scene, TextureImage} from "../index.js";
import {Renderer} from "./Renderer.js";

export class WebGLRenderer extends Renderer {
	/**
	 * @type {?WebGL2RenderingContext}
	 */
	_context;

	/**
	 * @type {Record.<String, WebGLProgram>}
	 */
	_programs;

	/**
	 * @type {Record.<String, WebGLVertexArrayObject>}
	 */
	_vaos;

	/**
	 * @type {Record.<String, WebGLBuffer>}
	 */
	_buffers;

	/**
	 * @type {Record.<String, WebGLUniformLocation>}
	 */
	_uniforms;

	/**
	 * @type {Record.<String, WebGLTexture>}
	 */
	_textures;

	/**
	 * @type {Record.<String, WebGLFramebuffer>}
	 */
	_framebuffers;

	/**
	 * @type {Record.<String, TextureImage>}
	 */
	_images;

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
		this._framebuffers = {};
		this._images = {};
	}

	getImages() {
		return this._images;
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

	resize() {
		this._canvas.width = this._viewport[2];
		this._canvas.height = this._viewport[3];

		this._context.viewport(
			this._viewport[0],
			this._viewport[1],
			this._viewport[2],
			this._viewport[3],
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
			{
				const vertexShaderInfoLog = this._context.getShaderInfoLog(vertexShader);

				if (vertexShaderInfoLog.length !== 0) {
					throw new Error(`VERTEX SHADER ${vertexShaderInfoLog}`);
				}
			}

			{
				const fragmentShaderInfoLog = this._context.getShaderInfoLog(fragmentShader);

				if (fragmentShaderInfoLog.length !== 0) {
					throw new Error(`FRAGMENT SHADER ${fragmentShaderInfoLog}`);
				}
			}

			{
				const programInfoLog = this._context.getProgramInfoLog(program);

				if (programInfoLog.length !== 0) {
					throw new Error(programInfoLog);
				}
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