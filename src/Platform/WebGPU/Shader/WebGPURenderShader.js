import {WebGPUShader} from "./WebGPUShader.js";

export class WebGPURenderShader extends WebGPUShader {
	#vertexShaderModule;
	#fragmentShaderModule;

	/**
	 * @param {GPUDevice} device
	 * @param {String} source
	 */
	constructor(device, source) {
		super();

		this.#vertexShaderModule = device.createShaderModule({
			code: source,
		});

		this.#fragmentShaderModule = device.createShaderModule({
			code: source,
		});
	}

	getVertexShaderModule() {
		return this.#vertexShaderModule;
	}

	getFragmentShaderModule() {
		return this.#fragmentShaderModule;
	}
}