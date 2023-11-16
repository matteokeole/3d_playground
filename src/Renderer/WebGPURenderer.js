import {Renderer} from "./Renderer.js";

export class WebGPURenderer extends Renderer {
	/**
	 * @type {?GPUDevice}
	 */
	_device;

	/**
	 * @type {?GPUCanvasContext}
	 */
	_context;

	/**
	 * @type {Object.<String, GPUBuffer>}
	 */
	_buffers;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);

		this._device = null;
		this._context = null;
		this._buffers = {};
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

		const format = navigator.gpu.getPreferredCanvasFormat();

		this._device = await adapter.requestDevice();
		this._context = this._canvas.getContext("webgpu");
		this._context.configure({
			device: this._device,
			format,
		});
	}

	resize() {
		this._canvas.width = this._viewport[2];
		this._canvas.height = this._viewport[3];
	}
}