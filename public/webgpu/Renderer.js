import {Scene} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";

export class Renderer extends WebGPURenderer {
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
	}

	render() {
		this.#writeCameraBuffer();

		const commandEncoder = this._device.createCommandEncoder();

		this.#renderVisibilityPass(commandEncoder);

		const commandBuffer = commandEncoder.finish();

		this._device.queue.submit([commandBuffer]);
	}

	async #loadShaderModules() {
		const shaderLoader = new ShaderLoader();

		const visibilityVertexShaderSource = await shaderLoader.load("public/webgpu/shaders/visibility.vert.wgsl");
		const visibilityFragmentShaderSource = await shaderLoader.load("public/webgpu/shaders/visibility.frag.wgsl");

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

		const vertexBuffer = this._device.createBuffer({
			label: "Vertex buffer",
			size: vertexCount * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const vertexBufferMap = new Float32Array(vertexBuffer.getMappedRange());

		for (let i = 0, offset = 0; i < meshes.length; i++) {
			const vertices = meshes[i].getGeometry().getVertices();

			vertexBufferMap.set(vertices, offset);

			offset += vertices.length;
		}

		vertexBuffer.unmap();

		return vertexBuffer;
	}

	#createIndexBuffer() {
		const meshes = this._scene.getMeshes();
		let indexCount = 0;

		for (let i = 0; i < meshes.length; i++) {
			indexCount += meshes[i].getGeometry().getIndices().length;
		}

		const indexBuffer = this._device.createBuffer({
			label: "Index buffer",
			size: indexCount * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const indexBufferMap = new Uint16Array(indexBuffer.getMappedRange());

		for (let i = 0, previousIndexCount = 0, previousVertexCount = 0; i < meshes.length; i++) {
			const indices = meshes[i].getGeometry().getIndices();

			for (let j = 0; j < indices.length; j++) {
				indexBufferMap[previousIndexCount + j] = previousVertexCount + indices[j];
			}

			previousIndexCount += indices.length;
			previousVertexCount += meshes[i].getGeometry().getVertices().length / 3;
		}

		indexBuffer.unmap();

		return indexBuffer;
	}

	#createIndirectBuffer() {
		/**
		 * @todo Sort meshes by type
		 */
		const instanceCount = this._scene.getMeshes().length;

		const indirectBuffer = this._device.createBuffer({
			label: "Indirect buffer",
			size: instanceCount * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const indirectBufferMap = new Uint32Array(indirectBuffer.getMappedRange());
		const meshes = this._scene.getMeshes();
		let indexCount = 0;
		let firstIndex = 0;

		/*

		Concepts:
		- Mesh: A geometry and a material grouped together
		- MeshInstance: An instance of a mesh in a scene

		const meshes = this._scene.getMeshes();
		let offset = 0;
		let firstIndex = 0;

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];
			const indexCount = mesh.getGeometry().getIndices().length;
			const instanceCount = this._scene.getInstanceCount(mesh);

			indirectBufferMap[offset + 0] = indexCount;
			indirectBufferMap[offset + 1] = instanceCount;
			indirectBufferMap[offset + 2] = firstIndex;

			offset += WebGPURenderer._INDIRECT_BUFFER_SIZE;
			firstIndex += indexCount;
		}

		*/

		for (let i = 0; i < meshes.length; i++) {
			indexCount = meshes[i].getGeometry().getIndices().length;

			indirectBufferMap.set(Uint32Array.of(
				indexCount, // indexCount — The number of indices to draw.
				1, // instanceCount — The number of instances to draw.
				firstIndex, // firstIndex — Offset into the index buffer, in indices, begin drawing from.
				0, // baseVertex — Added to each index value before indexing into the vertex buffers.
				0, // firstInstance — First instance to draw.
			), i * WebGPURenderer._INDIRECT_BUFFER_SIZE);

			firstIndex += indexCount;
		}

		indirectBuffer.unmap();

		return indirectBuffer;
	}

	#createCameraUniformBuffer() {
		const cameraUniformBuffer = this._device.createBuffer({
			label: "Camera uniform buffer",
			size: 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		return cameraUniformBuffer;
	}

	#createCameraBindGroupLayout() {
		const cameraBindGroupLayout = this._device.createBindGroupLayout({
			label: "Camera bind group layout",
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

		return cameraBindGroupLayout;
	}

	#createCameraBindGroup() {
		const cameraBindGroup = this._device.createBindGroup({
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

		return cameraBindGroup;
	}

	#createVisibilityPipelineLayout() {
		const visibilityPipelineLayout = this._device.createPipelineLayout({
			label: "Visibility pipeline layout",
			bindGroupLayouts: [
				this._bindGroupLayouts.camera,
			],
		});

		return visibilityPipelineLayout;
	}

	#createDepthTexture() {
		const depthTexture = this._device.createTexture({
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});

		return depthTexture;
	}

	#writeCameraBuffer() {
		const viewProjection = this._camera.getViewProjection();

		this._device.queue.writeBuffer(this._buffers.camera, 0, viewProjection);
	}

	/**
	 * @param {GPUCommandEncoder} commandEncoder
	 */
	#renderVisibilityPass(commandEncoder) {
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: this._context.getCurrentTexture().createView(),
					loadOp: "clear",
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

		const meshCount = this._scene.getMeshes().length;

		/*

		const meshes = this._scene.getMeshes();

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];
			const indirectBufferOffset = this.#getIndirectBufferOffset(mesh);
			const meshInstanceBindGroup = this.#getMeshInstanceBindGroup(mesh);

			// Bind projection buffer for all meshes of that type
			renderPass.setBindGroup(1, meshInstanceBindGroup);

			// Draw with the same (offsetted) indirect buffer
			renderPass.drawIndexedIndirect(this._buffers.indirect, indirectBufferOffset);
		}

		*/

		for (let i = 0; i < meshCount; i++) {
			const offset = i * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT;

			renderPass.drawIndexedIndirect(this._buffers.indirect, offset);
		}

		renderPass.end();
	}
}