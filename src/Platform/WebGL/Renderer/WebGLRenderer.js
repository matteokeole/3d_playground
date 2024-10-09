import {WebGLShader} from "../Shader/index.js";
import {TextureImage} from "../../../index.js";
import {Camera} from "../../../Camera/index.js";
import {Renderer} from "../../../Renderer/index.js";
import {Scene} from "../../../Scene/index.js";

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

	/**
	 * @param {String} name
	 * @returns {WebGLShader}
	 */
	getShader(name) {
		return super.getShader(name);
	}

	getImages() {
		return this._images;
	}

	/**
	 * @throws {Error} if WebGL2 is not supported
	 */
	async build() {
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
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	resize() {
		const canvas = this.getCanvas();
		const viewport = this.getViewport();

		canvas.width = viewport[2];
		canvas.height = viewport[3];

		this._context.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
	}

	dispose() {
		this._context.getExtension("WEBGL_lose_context").loseContext();

		// Remove the canvas from the DOM
		this.getCanvas().remove();
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

	/**
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
		const ARGUMENT_COUNT_TO_LOAD_SHADER_OVERLOAD = {
			2: this.#loadShaderFromSource,
			3: this.#loadShaderFromSeparatedSources,
			4: this.#loadShaderFromCommonAndSeparatedSources,
		};

		if (!(arguments.length in ARGUMENT_COUNT_TO_LOAD_SHADER_OVERLOAD)) {
			throw new Error(`Expected 2 to 4 arguments, but received ${arguments.length} instead.`);
		}

		const overload = ARGUMENT_COUNT_TO_LOAD_SHADER_OVERLOAD[arguments.length];

		return await overload.call(this, ...arguments);
	}

	/**
	 * @param {String} name
	 * @param {String} sourceUrl
	 */
	async #loadShaderFromSource(name, sourceUrl) {
		const textLoader = this.getTextLoader();
		const source = await textLoader.load(sourceUrl);
		const shader = WebGLShader.fromSource(this._context, source);

		if (name in this.getShaders()) {
			throw new Error(`The shader "${name}" is already defined in the shader map.`);
		}

		this.getShaders()[name] = shader;
	}

	/**
	 * @param {String} name
	 * @param {String} vertexSourceUrl
	 * @param {String} fragmentSourceUrl
	 */
	async #loadShaderFromSeparatedSources(name, vertexSourceUrl, fragmentSourceUrl) {
		const textLoader = this.getTextLoader();
		const vertexSource = await textLoader.load(vertexSourceUrl);
		const fragmentSource = await textLoader.load(fragmentSourceUrl);
		const shader = WebGLShader.fromSeparatedSources(this._context, vertexSource, fragmentSource);

		if (name in this.getShaders()) {
			throw new Error(`The shader "${name}" is already defined in the shader map.`);
		}

		this.getShaders()[name] = shader;
	}

	/**
	 * @param {String} name
	 * @param {String} commonSourceUrl
	 * @param {String} vertexSourceUrl
	 * @param {String} fragmentSourceUrl
	 */
	async #loadShaderFromCommonAndSeparatedSources(name, commonSourceUrl, vertexSourceUrl, fragmentSourceUrl) {
		const textLoader = this.getTextLoader();
		const commonSource = await textLoader.load(commonSourceUrl);
		const vertexSource = await textLoader.load(vertexSourceUrl);
		const fragmentSource = await textLoader.load(fragmentSourceUrl);
		const shader = WebGLShader.fromCommonAndSeparatedSources(this._context, commonSource, vertexSource, fragmentSource);

		if (name in this.getShaders()) {
			throw new Error(`The shader "${name}" is already defined in the shader map.`);
		}

		this.getShaders()[name] = shader;
	}
}