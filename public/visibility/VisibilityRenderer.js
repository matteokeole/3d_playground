import {Scene} from "../../src/index.js";
import {BoxGeometry} from "../../src/Geometry/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";

export class VisibilityRenderer extends WebGPURenderer {
	async build() {
		await super.build();
		await this.#loadShaderModules();
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		this._renderPipelines.visibility = this.#createVisibilityPipeline();
		this._textures.depth = this.#createDepthTexture();

		this.#writeVertexBuffer();
		this.#writeIndexBuffer();
		this.#writeIndirectBuffer();
	}

	render() {
		this.#writeCameraBuffer();
		this.#renderVisibilityPass();
	}

	async #loadShaderModules() {
		const shaderLoader = new ShaderLoader();

		const visibilityVertexShaderSource = await shaderLoader.load("public/visibility/shaders/visibility.vert.wgsl");
		const visibilityFragmentShaderSource = await shaderLoader.load("public/visibility/shaders/visibility.frag.wgsl");

		this._shaderModules.visibilityVertex = this.#createShaderModule(visibilityVertexShaderSource);
		this._shaderModules.visibilityFragment = this.#createShaderModule(visibilityFragmentShaderSource);
	}

	/**
	 * @param {String} source
	 */
	#createShaderModule(source) {
		return this._device.createShaderModule({
			code: source,
		});
	}

	#createVisibilityPipeline() {
		this._buffers.vertex = this.#createVertexBuffer();
		this._buffers.index = this.#createIndexBuffer();
		this._buffers.indirect = this.#createIndirectBuffer();
		this._buffers.camera = this.#createCameraUniformBuffer();

		this._bindGroupLayouts.camera = this.#createCameraBindGroupLayout();

		this._bindGroups.camera = this.#createCameraBindGroup();

		const visibilityPipelineLayout = this.#createVisibilityPipelineLayout();

		return this._device.createRenderPipeline({
			layout: visibilityPipelineLayout,
			vertex: {
				module: this._shaderModules.visibilityVertex,
				entryPoint: "main",
				buffers: [
					{
						arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
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
			depthStencil: {
				format: "depth24plus",
				depthWriteEnabled: true,
				depthCompare: "less",
			},
			fragment: {
				module: this._shaderModules.visibilityFragment,
				entryPoint: "main",
				targets: [
					{
						format: this._preferredCanvasFormat,
					},
				],
			},
		});
	}

	#createVertexBuffer() {
		const meshes = this._scene.getMeshes();
		let vertexCount = 0;

		for (let i = 0; i < meshes.length; i++) {
			vertexCount += meshes[i].getGeometry().getVertices().length;
		}

		return this._device.createBuffer({
			label: "Vertex buffer",
			size: vertexCount * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createIndexBuffer() {
		const meshes = this._scene.getMeshes();
		let indexCount = 0;

		for (let i = 0; i < meshes.length; i++) {
			indexCount += meshes[i].getGeometry().getIndices().length;
		}

		return this._device.createBuffer({
			label: "Index buffer",
			size: indexCount * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createIndirectBuffer() {
		/**
		 * @todo Sort meshes by type
		 */
		const instanceCount = this._scene.getMeshes().length;

		return this._device.createBuffer({
			label: "Indirect buffer",
			size: 5 * instanceCount * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createCameraUniformBuffer() {
		return this._device.createBuffer({
			label: "Camera view projection matrix",
			size: 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
	}

	#createCameraBindGroupLayout() {
		return this._device.createBindGroupLayout({
			label: "Camera view projection matrix bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					},
				},
			],
		});
	}

	#createCameraBindGroup() {
		return this._device.createBindGroup({
			label: "Camera view projection matrix bind group",
			layout: this._bindGroupLayouts.camera,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.camera,
					},
				},
			],
		});
	}

	#createVisibilityPipelineLayout() {
		return this._device.createPipelineLayout({
			label: "Visibility pipeline layout",
			bindGroupLayouts: [
				this._bindGroupLayouts.camera,
			],
		});
	}

	#createDepthTexture() {
		return this._device.createTexture({
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}

	#writeVertexBuffer() {
		const vertexBufferMap = new Float32Array(this._buffers.vertex.getMappedRange());
		const meshes = this._scene.getMeshes();

		for (let i = 0, previousCount = 0; i < meshes.length; i++) {
			const vertices = meshes[i].getGeometry().getVertices();

			vertexBufferMap.set(vertices, previousCount);

			previousCount += vertices.length;
		}

		this._buffers.vertex.unmap();
	}

	#writeIndexBuffer() {
		const indexBufferMap = new Uint16Array(this._buffers.index.getMappedRange());
		const meshes = this._scene.getMeshes();

		for (let i = 0, previousIndexCount = 0, previousVertexCount = 0; i < meshes.length; i++) {
			const indices = meshes[i].getGeometry().getIndices();

			for (let j = 0; j < indices.length; j++) {
				indexBufferMap[previousIndexCount + j] = previousVertexCount + indices[j];
			}

			previousIndexCount += indices.length;
			previousVertexCount += meshes[i].getGeometry().getVertices().length / 3;
		}

		this._buffers.index.unmap();
	}

	#writeIndirectBuffer() {
		const indirectBufferMap = new Uint32Array(this._buffers.indirect.getMappedRange());
		const meshes = this._scene.getMeshes();
		let indexCount = 0;
		let firstIndex = 0;

		for (let i = 0; i < meshes.length; i++) {
			indexCount = meshes[i].getGeometry().getIndices().length;

			indirectBufferMap.set(Uint32Array.of(
				indexCount, // indexCount — The number of indices to draw.
				1, // instanceCount — The number of instances to draw.
				firstIndex, // firstIndex — Offset into the index buffer, in indices, begin drawing from.
				0, // baseVertex — Added to each index value before indexing into the vertex buffers.
				0, // firstInstance — First instance to draw.
			), i * 5);

			firstIndex += indexCount;
		}

		this._buffers.indirect.unmap();
	}

	#writeCameraBuffer() {
		this._device.queue.writeBuffer(this._buffers.camera, 0, this._camera.getViewProjection());
	}

	#renderVisibilityPass() {
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
		renderPass.setPipeline(this._renderPipelines.visibility);
		renderPass.setBindGroup(0, this._bindGroups.camera);
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.setIndexBuffer(this._buffers.index, "uint16");

		const meshes = this._scene.getMeshes();

		for (let i = 0; i < meshes.length; i++) {
			renderPass.drawIndexedIndirect(this._buffers.indirect, i * 5 * Uint32Array.BYTES_PER_ELEMENT);
		}

		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}
}