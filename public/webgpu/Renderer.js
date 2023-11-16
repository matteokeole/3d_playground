import {ShaderLoader} from "../../src/Loader/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";

export class Renderer extends WebGPURenderer {
	/**
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	/**
	 * @type {?GPURenderPipeline}
	 */
	#renderPipeline;

	async build() {
		await super.build();

		const shaderLoader = new ShaderLoader();
		const vertexShaderSource = await shaderLoader.load("public/webgpu/shaders/vertex.wgsl");
		const fragmentShaderSource = await shaderLoader.load("public/webgpu/shaders/fragment.wgsl");

		this._buffers.vertex = this._device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 4 * 3,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = this._device.createBindGroupLayout({
			entries: [
				// Color buffer example
				/* {
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				}, */
			],
		});

		this.#bindGroup = this._device.createBindGroup({
			layout: bindGroupLayout,
			entries: [],
		});

		this.#renderPipeline = this._device.createRenderPipeline({
			layout: this._device.createPipelineLayout({
				bindGroupLayouts: [
					bindGroupLayout,
				],
			}),
			vertex: {
				module: this._device.createShaderModule({
					code: vertexShaderSource,
				}),
				entryPoint: "main",
				buffers: [
					{
						arrayStride: 8,
						attributes: [
							{
								format: "float32x2",
								offset: 0,
								shaderLocation: 0,
							},
						],
					},
				],
			},
			fragment: {
				module: this._device.createShaderModule({
					code: fragmentShaderSource,
				}),
				entryPoint: "main",
				targets: [
					{
						format: navigator.gpu.getPreferredCanvasFormat(),
					},
				],
			},
		});
	}

	render() {
		const encoder = this._device.createCommandEncoder();

		const w = .3, h = .1;

		this._device.queue.writeBuffer(this._buffers.vertex, 0, Float32Array.of(
			0,  0,
			w,  0,
			0, -h,
			// 0, -h,
			// w,  0,
			// w, -h,
		));

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this._context.getCurrentTexture().createView(),
					loadOp: "load",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.draw(6);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}
}