import {Scene} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";

export class VisibilityRenderer extends WebGPURenderer {
	async build() {
		await super.build();

		const shaderLoader = new ShaderLoader();

		this._shaderModules.visibilityVertex = this.#createShaderModule(await shaderLoader.load("public/visibility/shaders/visibility.vert.wgsl"));
		this._shaderModules.visibilityFragment = this.#createShaderModule(await shaderLoader.load("public/visibility/shaders/visibility.frag.wgsl"));
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		this._renderPipelines.visibility = this.#createVisibilityPipeline();
		this._textures.depth = this.#createDepthTexture();

		this.#writeIndirectBuffer();
		// this.#writeIndexBuffer();
		this.#writeVertexBuffer();
		this.#writeMeshBuffer();
	}

	render() {
		this.#writeCameraBuffer();
		this.#renderPrePass();
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
		this._buffers.indirect = this.#createIndirectBuffer();
		// this._buffers.index = this.#createIndexBuffer();
		this._buffers.vertex = this.#createVertexBuffer();
		this._buffers.mesh = this.#createMeshStorageBuffer();
		this._buffers.camera = this.#createCameraUniformBuffer();

		this._bindGroupLayouts.mesh = this.#createMeshBindGroupLayout();
		this._bindGroupLayouts.camera = this.#createCameraBindGroupLayout();

		this._bindGroups.mesh = this.#createMeshBindGroup();
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

	#createIndirectBuffer() {
		return this._device.createBuffer({
			label: "Indirect (non-indexed) buffer",
			size: 4 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createIndexBuffer() {
		const indexCount = this._scene.getMeshes()[0].getGeometry().getIndices().length;

		return this._device.createBuffer({
			label: "Index buffer",
			size: indexCount * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createVertexBuffer() {
		const vertexCount = this._scene.getMeshes()[0].getGeometry().getNonIndexedVertices().length;

		return this._device.createBuffer({
			label: "Vertex buffer",
			size: vertexCount * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
	}

	#createMeshStorageBuffer() {
		const meshCount = this._scene.getMeshes().length;

		return this._device.createBuffer({
			label: "Mesh projection matrices",
			size: meshCount * 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
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

	#createMeshBindGroupLayout() {
		return this._device.createBindGroupLayout({
			label: "Mesh projection matrix bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
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

	#createMeshBindGroup() {
		return this._device.createBindGroup({
			label: "Mesh projection matrix bind group",
			layout: this._bindGroupLayouts.mesh,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.mesh,
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
				this._bindGroupLayouts.mesh,
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

	#writeIndirectBuffer() {
		const meshes = this._scene.getMeshes();
		const meshCount = meshes.length;
		const vertexCount = meshes[0].getGeometry().getNonIndexedVertices().length;
		const indirectMap = new Uint32Array(this._buffers.indirect.getMappedRange());

		indirectMap.set(Uint32Array.of(
			vertexCount,
			meshCount,
			0,
			0,
		));

		this._buffers.indirect.unmap();
	}

	#writeIndexBuffer() {
		const indices = this._scene.getMeshes()[0].getGeometry().getIndices();
		const indexMap = new Uint16Array(this._buffers.index.getMappedRange());

		indexMap.set(indices);

		this._buffers.index.unmap();
	}

	#writeVertexBuffer() {
		const vertices = this._scene.getMeshes()[0].getGeometry().getNonIndexedVertices();
		const vertexMap = new Float32Array(this._buffers.vertex.getMappedRange());

		vertexMap.set(vertices);

		this._buffers.vertex.unmap();
	}

	#writeMeshBuffer() {
		const meshes = this._scene.getMeshes();
		const meshMap = new Float32Array(this._buffers.mesh.getMappedRange());

		for (let i = 0; i < meshes.length; i++) {
			meshMap.set(meshes[i].getProjection(), i * 16);
		}

		this._buffers.mesh.unmap();
	}

	#writeCameraBuffer() {
		this._device.queue.writeBuffer(this._buffers.camera, 0, this._camera.getViewProjection());
	}

	#renderPrePass() {
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
		renderPass.setBindGroup(0, this._bindGroups.mesh);
		renderPass.setBindGroup(1, this._bindGroups.camera);
		// renderPass.setIndexBuffer(this._buffers.index, "uint16");
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.drawIndirect(this._buffers.indirect, 0);
		renderPass.end();

		this._device.queue.submit([
			encoder.finish(),
		]);
	}
}