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

		this._buffers.camera = this._device.createBuffer({
			size: 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = this._device.createBindGroupLayout({
			entries: [
				// Color buffer example
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

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;

		const meshes = this._scene.getMeshes();

		this._buffers.vertex = this._device.createBuffer({
			size: meshes.length * 3 * 3 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const map = new Float32Array(this._buffers.vertex.getMappedRange());

		for (let i = 0, length = meshes.length; i < length; i++) {
			map.set(meshes[i].getGeometry().getVertices(), i * 3 * 3);
		}

		this._buffers.vertex.unmap();
	}

	/**
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	render() {
		const viewProjectionInverse = this._camera.projection.invert().multiply(this._camera.view.invert());
		this._device.queue.writeBuffer(this._buffers.camera, 0, viewProjectionInverse);

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
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.draw(this._scene.getMeshes().length * 3);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}
}