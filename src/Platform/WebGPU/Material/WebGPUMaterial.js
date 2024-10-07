import {Material} from "../../../Material/index.js";
import {WebGPUShader} from "../Shader/index.js";

/**
 * @typedef {Object} WebGPUMaterialDescriptor
 * @property {GPUDevice} device
 * @property {GPUPipelineLayout} pipelineLayout
 * @property {String} preferredCanvasFormat
 * @property {WebGPUShader} shader
 */

export class WebGPUMaterial extends Material {
	#shader;
	#pipeline;

	/**
	 * @param {WebGPUMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#shader = descriptor.shader;
		this.#pipeline = descriptor.device.createRenderPipeline({
			layout: descriptor.pipelineLayout,
			vertex: {
				entryPoint: null, // Determined automatically
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