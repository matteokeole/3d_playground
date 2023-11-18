import {Scene} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";
import {Camera} from "../hl2/Camera.js";

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

		this._buffers.indirect = this._device.createBuffer({
			size: 5 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
		});

		this._device.queue.writeBuffer(this._buffers.indirect, 0, Uint32Array.of(0, 1, 0, 0, 0));

		this._buffers.camera = this._device.createBuffer({
			size: 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = this._device.createBindGroupLayout({
			entries: [
				// Camera uniform buffer
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					},
				},
			],
		});

		this.#bindGroup = this._device.createBindGroup({
			layout: bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.camera,
					},
				},
			],
		});

		const pipelineLayout = this._device.createPipelineLayout({
			bindGroupLayouts: [
				bindGroupLayout,
			],
		});

		this.#renderPipeline = this._device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: this._device.createShaderModule({
					code: vertexShaderSource,
				}),
				entryPoint: "main",
				buffers: [
					{
						arrayStride: 12,
						attributes: [
							{
								format: "float32x3",
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

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;

		const meshes = this._scene.getMeshes();

		this._device.queue.writeBuffer(this._buffers.indirect, 0, Uint32Array.of(meshes.length * 6));

		this._buffers.index = this._device.createBuffer({
			size: meshes.length * 2 * 3 * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX,
			mappedAtCreation: true,
		});

		this._buffers.vertex = this._device.createBuffer({
			size: meshes.length * 3 * 4 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});

		const indexMap = new Uint16Array(this._buffers.index.getMappedRange());
		const vertexMap = new Float32Array(this._buffers.vertex.getMappedRange());

		for (let i = 0, length = meshes.length; i < length; i++) {
			const firstIndex = i * 4;

			indexMap.set(Uint16Array.of(
				firstIndex, firstIndex + 1, firstIndex + 2,
				firstIndex, firstIndex + 2, firstIndex + 3,
			), i * 2 * 3);
			vertexMap.set(meshes[i].getGeometry().getVertices(), i * 3 * 4);
		}

		this._buffers.index.unmap();
		this._buffers.vertex.unmap();
	}

	/**
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	render() {
		this._device.queue.writeBuffer(this._buffers.camera, 0, this._camera.getViewProjection());

		const encoder = this._device.createCommandEncoder();

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
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.setIndexBuffer(this._buffers.index, "uint16");
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.drawIndexedIndirect(this._buffers.indirect, 0);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}
}