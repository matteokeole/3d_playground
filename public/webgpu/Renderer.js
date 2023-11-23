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

	/**
	 * @type {?GPUSampler}
	 */
	#sampler;

	/**
	 * @type {Number}
	 */
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
					texture: {},
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
					resource: this._textures.test.createView(),
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
		/* for (let i = 0, length = images.length; i < length; i++) {
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
				},
				[
					images[i].bitmap.width,
					images[i].bitmap.height,
				],
			);
		} */

		const image = images[3];

		this._device.queue.copyExternalImageToTexture(
			{
				source: image.bitmap,
			}, {
				texture: this._textures.test,
			}, {
				width: image.bitmap.width,
				height: image.bitmap.height,
			},
		);
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
		renderPass.drawIndexedIndirect(this._buffers.indirect, 0);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}

	#buildScene() {
		const meshes = this._scene.getMeshes();

		this._device.queue.writeBuffer(this._buffers.indirect, 0, Uint32Array.of(meshes.length * 6));

		this._buffers.index = this._device.createBuffer({
			size: meshes.length * 2 * 3 * Uint16Array.BYTES_PER_ELEMENT,
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

		const indexMap = new Uint16Array(this._buffers.index.getMappedRange());
		const vertexMap = new Float32Array(this._buffers.vertex.getMappedRange());
		const uvMap = new Float32Array(this._buffers.uv.getMappedRange());

		for (let i = 0, length = meshes.length; i < length; i++) {
			const firstIndex = i * 4;

			indexMap.set(Uint16Array.of(
				firstIndex, firstIndex + 1, firstIndex + 2,
				firstIndex, firstIndex + 2, firstIndex + 3,
			), i * 2 * 3);
			vertexMap.set(meshes[i].getGeometry().getVertices(), i * 4 * 3);
			uvMap.set(Uint8Array.of(
				0, 1,
				0, 0,
				1, 0,
				1, 1,
			), i * 4 * 2);
		}

		this._buffers.index.unmap();
		this._buffers.vertex.unmap();
		this._buffers.uv.unmap();
	}

	#testTexture() {
		/* this._textures.array = this._device.createTexture({
			size: {
				width: 512,
				height: 512,
				depthOrArrayLayers: this.#imageCount,
			},
			format: "rgba8unorm",
			usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
		}); */
		this._textures.test = this._device.createTexture({
			size: [512, 512],
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
		});

		/* const texture = new Uint8Array(512 * 512 * 4);

		for (let i = 0; i < 512 * 512; i += 4) {
			texture.set(Uint8Array.of(i / 1024, i / 1024, i / 1024, 0), i);
		}

		this._device.queue.writeTexture(
			{
				texture: this._textures.test,
			},
			texture,
			{
				bytesPerRow: 512 * Float32Array.BYTES_PER_ELEMENT,
			},
			[512, 512],
		); */
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