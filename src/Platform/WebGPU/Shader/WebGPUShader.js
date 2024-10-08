import {Shader} from "../../../Shader/index.js";

export class WebGPUShader extends Shader {
	/**
	 * @param {GPUDevice} device
	 * @param {String} name
	 * @param {String} source
	 */
	static fromSource(device, name, source) {
		return new WebGPUShader(device, name, source, source);
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} name
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	static fromSeparatedSources(device, name, vertexSource, fragmentSource) {
		return new WebGPUShader(device, name, vertexSource, fragmentSource);
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} name
	 * @param {String} commonSource
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	static fromCommonAndSeparatedSources(device, name, commonSource, vertexSource, fragmentSource) {
		const commonVertexSource = `${commonSource}\n${vertexSource}`;
		const commonFragmentSource = `${commonSource}\n${fragmentSource}`;

		return new WebGPUShader(device, name, commonVertexSource, commonFragmentSource);
	}

	#name;
	#vertexShaderModule;
	#fragmentShaderModule;

	/**
	 * @param {GPUDevice} device
	 * @param {String} name
	 * @param {String} vertexSource
	 * @param {String} fragmentSource
	 */
	constructor(device, name, vertexSource, fragmentSource) {
		super();

		this.#name = name;
		this.#vertexShaderModule = device.createShaderModule({
			label: `${name} (vertex)`,
			code: vertexSource,
		});
		this.#fragmentShaderModule = device.createShaderModule({
			label: `${name} (fragment)`,
			code: fragmentSource,
		});
	}

	getName() {
		return this.#name;
	}

	getVertexShaderModule() {
		return this.#vertexShaderModule;
	}

	getFragmentShaderModule() {
		return this.#fragmentShaderModule;
	}
}