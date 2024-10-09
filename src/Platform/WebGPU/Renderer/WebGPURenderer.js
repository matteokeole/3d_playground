import {Renderer} from "../../../Renderer/Renderer.js";
import {Camera} from "../../../Camera/index.js";
import {WebGPUShader} from "../Shader/index.js";

export class WebGPURenderer extends Renderer {
	static _INDIRECT_BUFFER_SIZE = 4;

	/**
	 * @type {?GPUDevice}
	 */
	#device;

	/**
	 * @type {?GPUCanvasContext}
	 */
	_context;

	/**
	 * @type {?GPUTextureFormat}
	 */
	_preferredCanvasFormat;

	/**
	 * @type {Record.<String, GPUComputePipeline>}
	 */
	_computePipelines;

	/**
	 * @type {Record.<String, GPURenderPipeline>}
	 */
	_renderPipelines;

	/**
	 * @type {Record.<String, GPUBindGroup>}
	 */
	_bindGroups;

	/**
	 * @type {Record.<String, GPUBindGroupLayout>}
	 */
	_bindGroupLayouts;

	/**
	 * @type {Record.<String, GPUBuffer>}
	 */
	_buffers;

	/**
	 * @type {Record.<String, GPUTexture>}
	 */
	_textures;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);

		this.#device = null;
		this._context = null;
		this._preferredCanvasFormat = null;
		this._computePipelines = {};
		this._renderPipelines = {};
		this._bindGroups = {};
		this._bindGroupLayouts = {};
		this._buffers = {};
		this._textures = {};
	}

	getDevice() {
		return this.#device;
	}

	/**
	 * @param {String} name
	 * @returns {WebGPUShader}
	 */
	getShader(name) {
		return super.getShader(name);
	}

	/**
	 * @param {Object} scene
	 */
	setScene(scene) {
		super.setScene(scene);
	}

	/**
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	/**
	 * @throws {Error} if WebGPU is not supported
	 * @throws {Error} if the adapter request failed
	 */
	async build() {
		if (!("gpu" in navigator)) {
			throw new Error("This browser doesn't support WebGPU.");
		}

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter === null) {
			throw new Error("Couldn't request a WebGPU adapter.");
		}

		this.#device = await adapter.requestDevice();
		this._context = this._canvas.getContext("webgpu");
		this._preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

		this._context.configure({
			device: this.#device,
			format: this._preferredCanvasFormat,
		});
	}

	resize() {
		const canvas = this.getCanvas();
		const viewport = this.getViewport();

		canvas.width = viewport[2];
		canvas.height = viewport[3];
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
		const shader = WebGPUShader.fromSource(this.#device, name, source);

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
		const shader = WebGPUShader.fromSeparatedSources(this.#device, name, vertexSource, fragmentSource);

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
		const shader = WebGPUShader.fromCommonAndSeparatedSources(this.#device, name, commonSource, vertexSource, fragmentSource);

		if (name in this.getShaders()) {
			throw new Error(`The shader "${name}" is already defined in the shader map.`);
		}

		this.getShaders()[name] = shader;
	}
}