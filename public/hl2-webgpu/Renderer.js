import {Scene} from "../../src/index.js";
import {Camera} from "../../src/Camera/index.js";
import {TextLoader} from "../../src/Loader/index.js";
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

	/**
	 * @type {?GPUSampler}
	 */
	#sampler;

	/**
	 * @type {import("../../src/Loader/ImageBitmapLoader.js").Image[]}
	 */
	#images;

	#imageCount;

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {Scene} scene
	 * @param {Number} imageCount
	 */
	constructor(canvas, scene, imageCount) {
		super(canvas);

		this._scene = scene;
		this.#imageCount = imageCount;
	}

	async build() {
		await super.build();

		const textLoader = new TextLoader();
		const vertexShaderSource = await textLoader.load("public/hl2-webgpu/shaders/vertex.wgsl");
		const fragmentShaderSource = await textLoader.load("public/hl2-webgpu/shaders/fragment.wgsl");

		this.#createBuffers();

		this._textures.depth = this._device.createTexture({
			size: {
				width: innerWidth,
				height: innerHeight,
			},
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});

		this.#buildScene();
		this.#testTexture();
		this.#createSampler();

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
				// Material texture array
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d-array",
						multisampled: false,
					},
				},
				// Material sampler
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
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
				}, {
					binding: 1,
					resource: this._textures.array.createView(),
				}, {
					binding: 2,
					resource: this.#sampler,
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
						arrayStride: 12 * Float32Array.BYTES_PER_ELEMENT,
						stepMode: "instance",
						attributes: [
							{
								format: "float32x3",
								offset: 0,
								shaderLocation: 0,
							}, {
								format: "float32x3",
								offset: 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 1,
							}, {
								format: "float32x3",
								offset: 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 2,
							}, {
								format: "float32x3",
								offset: 3 * 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 3,
							},
						],
					}, {
						arrayStride: 9 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT,
						stepMode: "instance",
						attributes: [
							{
								format: "float32x3",
								offset: 0,
								shaderLocation: 4,
							}, {
								format: "float32x3",
								offset: 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 5,
							}, {
								format: "float32x3",
								offset: 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 6,
							}, {
								format: "float32",
								offset: 3 * 3 * Float32Array.BYTES_PER_ELEMENT,
								shaderLocation: 7,
							},
						],
					},
				],
			},
			primitive: {
				cullMode: "front",
			},
			depthStencil: {
				format: "depth24plus",
				depthWriteEnabled: true,
				depthCompare: "less",
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
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this._camera = camera;
	}

	/**
	 * @param {import("../../src/Loader/ImageBitmapLoader.js").Image[]} images
	 */
	loadImages(images) {
		this.#images = images;

		for (let i = 0, length = images.length; i < length; i++) {
			if (images[i].bitmap.width > 512 || images[i].bitmap.height > 512) {
				this._textures.array.destroy();

				throw new Error("The image dimensions must not overflow 512x512.");
			}

			this._device.queue.copyExternalImageToTexture(
				{
					source: images[i].bitmap,
				}, {
					texture: this._textures.array,
					origin: [0, 0, i],
				}, [
					images[i].bitmap.width,
					images[i].bitmap.height,
				],
			);
		}
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
			depthStencilAttachment: {
				view: this._textures.depth.createView(),
				depthClearValue: 1,
				depthLoadOp: "clear",
				depthStoreOp: "store",
			},
		});
		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.setIndexBuffer(this._buffers.index, "uint16");
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.setVertexBuffer(1, this._buffers.material);
		renderPass.drawIndexedIndirect(this._buffers.indirect, 0);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}

	/**
	 * The mesh count is needed to fill the indirect buffer
	 */
	#createBuffers() {
		this._buffers.indirect = this._device.createBuffer({
			size: 5 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
		});

		this._buffers.camera = this._device.createBuffer({
			size: 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
	}

	#buildScene() {
		const meshes = this._scene.getMeshes();

		this._device.queue.writeBuffer(this._buffers.indirect, 0, Uint32Array.of(meshes.length * 6, meshes.length, 0, 0, 0));

		this._buffers.index = this._device.createBuffer({
			size: meshes.length * 6 * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX,
			mappedAtCreation: true,
		});

		this._buffers.vertex = this._device.createBuffer({
			size: meshes.length * 4 * 3 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});

		this._buffers.uv = this._device.createBuffer({
			size: meshes.length * 4 * 2 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});

		this._buffers.material = this._device.createBuffer({
			size: meshes.length * (9 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT),
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});

		const indexMap = new Uint16Array(this._buffers.index.getMappedRange());
		const vertexMap = new Float32Array(this._buffers.vertex.getMappedRange());
		const uvMap = new Float32Array(this._buffers.uv.getMappedRange());
		const materialMap = new Float32Array(this._buffers.material.getMappedRange());

		for (let i = 0, length = meshes.length; i < length; i++) {
			const firstIndex = i * 4;

			indexMap.set(Uint16Array.of(
				firstIndex, firstIndex + 1, firstIndex + 2,
				firstIndex, firstIndex + 2, firstIndex + 3,
			), i * 6);
			vertexMap.set(meshes[i].getGeometry().getVertices(), i * 4 * 3);
			uvMap.set(Uint32Array.of(
				0, 1,
				0, 0,
				1, 0,
				1, 1,
			), i * 4 * 2);

			materialMap.set(Float32Array.of(
				...meshes[i].getMaterial().getTextureMatrix(),
				meshes[i].getMaterial().getTextureIndex(),
			), i * 10);
		}

		this._buffers.index.unmap();
		this._buffers.vertex.unmap();
		this._buffers.uv.unmap();
		this._buffers.material.unmap();
	}

	#testTexture() {
		this._textures.array = this._device.createTexture({
			size: [512, 512, this.#imageCount],
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
		});
	}

	#createSampler() {
		this.#sampler = this._device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "linear",
			minFilter: "nearest",
			mipmapFilter: "nearest",
			maxAnisotropy: 1,
		});
	}
}