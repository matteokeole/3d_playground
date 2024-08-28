import {Shader} from "../../../Shader/index.js";

export class WebGPUShader extends Shader {
	#vertexShaderModule;
	#fragmentShaderModule;

	/**
	 * @param {GPUDevice} device
	 * @param {String} source
	 */
	static fromSource(device, source) {
		return new WebGPUShader(device, source, source);
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	static fromSeparatedSources(device, vertexSource, fragmentSource) {
		return new WebGPUShader(device, vertexSource, fragmentSource);
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} commonSource
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	static fromCommonAndSeparatedSources(device, commonSource, vertexSource, fragmentSource) {
		const commonVertexSource = `${commonSource}\n${vertexSource}`;
		const commonFragmentSource = `${commonSource}\n${fragmentSource}`;

		return new WebGPUShader(device, commonVertexSource, commonFragmentSource);
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	constructor(device, vertexSource, fragmentSource) {
		super();

		this.#vertexShaderModule = device.createShaderModule({
			code: vertexSource,
		});
		this.#fragmentShaderModule = device.createShaderModule({
			code: fragmentSource,
		});
	}

	getVertexShaderModule() {
		return this.#vertexShaderModule;
	}

	getFragmentShaderModule() {
		return this.#fragmentShaderModule;
	}
}