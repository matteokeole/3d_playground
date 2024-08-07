import {Camera, Scene} from "../index.js";
import {Renderer} from "./Renderer.js";

export class WebGPURenderer extends Renderer {
	static _INDIRECT_BUFFER_SIZE = 4;

	/**
	 * @type {?GPUDevice}
	 */
	_device;

	/**
	 * @type {?GPUCanvasContext}
	 */
	_context;

	/**
	 * @type {?GPUTextureFormat}
	 */
	_preferredCanvasFormat;

	/**
	 * @type {Record.<String, GPUShaderModule>}
	 */
	_shaderModules;

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

		this._device = null;
		this._context = null;
		this._preferredCanvasFormat = null;
		this._shaderModules = {};
		this._computePipelines = {};
		this._renderPipelines = {};
		this._bindGroups = {};
		this._bindGroupLayouts = {};
		this._buffers = {};
		this._textures = {};
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;
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

		this._device = await adapter.requestDevice();
		this._context = this._canvas.getContext("webgpu");
		this._preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

		this._context.configure({
			device: this._device,
			format: this._preferredCanvasFormat,
		});
	}

	resize() {
		this._canvas.width = this._viewport[2];
		this._canvas.height = this._viewport[3];
	}
}