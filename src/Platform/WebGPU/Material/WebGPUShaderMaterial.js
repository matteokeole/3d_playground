import {ShaderMaterial} from "../../../Material/index.js";
import {WebGPUShader} from "../Shader/index.js";

/**
 * @typedef {Object} WebGPUShaderMaterialDescriptor
 * @property {GPUDevice} device
 * @property {GPUPipelineLayout} pipelineLayout
 * @property {String} preferredCanvasFormat
 * @property {WebGPUShader} shader
 */

export class WebGPUShaderMaterial extends ShaderMaterial {
	#shader;
	#pipeline;

	/**
	 * @param {WebGPUShaderMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#shader = descriptor.shader;
		this.#pipeline = descriptor.device.createPipeline({
			layout: descriptor.pipelineLayout,
			vertex: {
				module: this.#shader.getVertexShaderModule(),
			},
			/**
			 * @todo Keep this?
			 */
			/* primitive: {
				topology: "triangle-list",
				frontFace: "cw",
				cullMode: "back",
			}, */
			fragment: {
				module: this.#shader.getFragmentShaderModule(),
				targets: [
					{
						format: descriptor.preferredCanvasFormat,
						/**
						 * @todo Keep this?
						 */
						/* blend: {
							color: {
								operation: "add",
								srcFactor: "src-alpha",
								dstFactor: "one-minus-src-alpha",
							},
							alpha: {
								operation: "add",
								srcFactor: "src-alpha",
								dstFactor: "one-minus-src-alpha",
							},
						}, */
					},
				],
			},
		});
	}

	getShader() {
		return this.#shader;
	}

	getPipeline() {
		return this.#pipeline;
	}
}