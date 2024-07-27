import {Scene} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {Mesh} from "../../src/Mesh/index.js";
import {WebGPURenderer} from "../../src/Renderer/index.js";

export class Renderer extends WebGPURenderer {
	/**
	 * @type {Record.<String, GPUBuffer>}
	 */
	#meshStorageBuffers;

	/**
	 * @type {Record.<String, GPUBindGroup>}
	 */
	#meshBindGroups;

	constructor(canvas) {
		super(canvas);

		this.#meshStorageBuffers = {};
		this.#meshBindGroups = {};
	}

	async build() {
		await super.build();
		await this.#loadShaderModules();
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		this._textures.visibility = this.#createVisibilityTexture();
		this._renderPipelines.visibility = this.#createVisibilityRenderPipeline();
		this._renderPipelines.base = this.#createBaseRenderPipeline();
	}

	render() {
		this.#writeCameraBuffer();

		const commandEncoder = this._device.createCommandEncoder();

		this.#renderVisibilityPass(commandEncoder);
		this.#renderBasePass(commandEncoder);

		const commandBuffer = commandEncoder.finish();

		this._device.queue.submit([commandBuffer]);
	}

	/**
	 * @param {Mesh} mesh
	 * @returns {?GPUBuffer}
	 */
	getMeshBuffer(mesh) {
		const geometryName = mesh.getGeometry().constructor.name;
		const buffer = this.#meshStorageBuffers[geometryName];

		if (!buffer) {
			return null;
		}

		return buffer;
	}

	/**
	 * @param {GPUBuffer} buffer
	 * @param {GPUSize64} bufferOffset
	 * @param {BufferSource|SharedArrayBuffer} data
	 */
	writeMeshBuffer(buffer, bufferOffset, data) {
		this._device.queue.writeBuffer(buffer, bufferOffset, data);
	}

	async #loadShaderModules() {
		const shaderLoader = new ShaderLoader();

		// Visibility
		const visibilityVertexShaderSource = await shaderLoader.load("public/webgpu/shaders/visibility.vert.wgsl");
		const visibilityFragmentShaderSource = await shaderLoader.load("public/webgpu/shaders/visibility.frag.wgsl");

		// Base
		const baseVertexShaderSource = await shaderLoader.load("public/webgpu/shaders/base.vert.wgsl");
		const baseFragmentShaderSource = await shaderLoader.load("public/webgpu/shaders/base.frag.wgsl");

		this._shaderModules.visibilityVertex = this.#createShaderModule("Visibility vertex shader", visibilityVertexShaderSource);
		this._shaderModules.visibilityFragment = this.#createShaderModule("Visibility fragment shader", visibilityFragmentShaderSource);
		this._shaderModules.baseVertex = this.#createShaderModule("Base vertex shader", baseVertexShaderSource);
		this._shaderModules.baseFragment = this.#createShaderModule("Base fragment shader", baseFragmentShaderSource);
	}

	/**
	 * @param {String} label
	 * @param {String} code
	 */
	#createShaderModule(label, code) {
		const shaderModule = this._device.createShaderModule({
			label,
			code,
		});

		return shaderModule;
	}

	#createVisibilityRenderPipeline() {
		this._buffers.vertex = this.#createVertexBuffer();
		this._buffers.index = this.#createIndexBuffer();
		this._buffers.indirect = this.#createIndirectBuffer();
		this._buffers.camera = this.#createCameraUniformBuffer();

		this._bindGroupLayouts.mesh = this.#createMeshBindGroupLayout();

		const geometries = this._scene.getGeometries();

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const geometryName = geometry.constructor.name;
			const meshes = this._scene.getMeshesByGeometry(geometry);

			const meshStorageBuffer = this.#createMeshStorageBuffer(meshes);
			const meshBindGroup = this.#createMeshBindGroup(meshStorageBuffer);

			this.#meshStorageBuffers[geometryName] = meshStorageBuffer;
			this.#meshBindGroups[geometryName] = meshBindGroup;
		}

		this._bindGroupLayouts.camera = this.#createCameraBindGroupLayout();

		this._bindGroups.camera = this.#createCameraBindGroup();

		const visibilityPipelineLayout = this.#createVisibilityPipelineLayout();

		const visibilityRenderPipeline = this._device.createRenderPipeline({
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
			primitive: {
				topology: "triangle-list",
				frontFace: "cw",
				cullMode: "back",
			},
			fragment: {
				module: this._shaderModules.visibilityFragment,
				entryPoint: "main",
				targets: [
					{
						format: "rg32uint",
					},
				],
			},
		});

		return visibilityRenderPipeline;
	}

	#createBaseRenderPipeline() {
		this._bindGroupLayouts.visibility = this.#createVisibilityBindGroupLayout();

		this._bindGroups.visibility = this.#createVisibilityBindGroup();

		const basePipelineLayout = this.#createBasePipelineLayout();

		const baseRenderPipeline = this._device.createRenderPipeline({
			layout: basePipelineLayout,
			vertex: {
				module: this._shaderModules.baseVertex,
				entryPoint: "main",
			},
			primitive: {
				topology: "triangle-list",
				frontFace: "cw",
				cullMode: "back",
			},
			fragment: {
				module: this._shaderModules.baseFragment,
				entryPoint: "main",
				targets: [
					{
						format: this._preferredCanvasFormat,
					},
				],
			},
		});

		return baseRenderPipeline;
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
		const meshCount = this._scene.getMeshes().length;

		const indirectBuffer = this._device.createBuffer({
			label: "Indirect buffer",
			size: meshCount * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
		const indirectBufferMap = new Uint32Array(indirectBuffer.getMappedRange());

		const geometries = this._scene.getGeometries();
		let offset = 0;
		let firstIndex = 0;

		// Create a indirect sub-buffer for each unique geometry
		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const indexCount = geometry.getIndices().length;
			const instanceCount = this._scene.getInstanceCount(geometry);

			indirectBufferMap[offset + 0] = indexCount; // The number of indices to draw
			indirectBufferMap[offset + 1] = instanceCount; // The number of instances to draw
			indirectBufferMap[offset + 2] = firstIndex; // Offset into the index buffer, in indices, begin drawing from

			offset += WebGPURenderer._INDIRECT_BUFFER_SIZE;
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

	/**
	 * @param {Mesh[]} meshes
	 */
	#createMeshStorageBuffer(meshes) {
		const meshStorageBuffer = this._device.createBuffer({
			label: "Mesh storage buffer",
			size: meshes.length * 16 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		});

		const meshStorageArray = new Float32Array(meshes.length * 16);

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			meshStorageArray.set(mesh.getProjection(), i * 16);
		}

		this._device.queue.writeBuffer(meshStorageBuffer, 0, meshStorageArray);

		return meshStorageBuffer;
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

	#createVisibilityBindGroupLayout() {
		const visibilityBindGroupLayout = this._device.createBindGroupLayout({
			label: "Visibility bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				},
			],
		});

		return visibilityBindGroupLayout;
	}

	#createMeshBindGroupLayout() {
		const meshBindGroupLayout = this._device.createBindGroupLayout({
			label: "Mesh bind group layout",
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

		return meshBindGroupLayout;
	}

	#createCameraBindGroup() {
		const cameraBindGroup = this._device.createBindGroup({
			label: "Camera bind group",
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

	#createVisibilityBindGroup() {
		const visibilitySampler = this._device.createSampler();

		const visibilityBindGroup = this._device.createBindGroup({
			label: "Visibility bind group",
			layout: this._bindGroupLayouts.visibility,
			entries: [
				{
					binding: 0,
					resource: this._textures.visibility.createView(),
				}, {
					binding: 1,
					resource: visibilitySampler,
				},
			],
		});

		return visibilityBindGroup;
	}

	/**
	 * @param {GPUBuffer} buffer
	 */
	#createMeshBindGroup(buffer) {
		const meshBindGroup = this._device.createBindGroup({
			label: "Mesh bind group",
			layout: this._bindGroupLayouts.mesh,
			entries: [
				{
					binding: 0,
					resource: {
						buffer,
					},
				},
			],
		});

		return meshBindGroup;
	}

	#createVisibilityPipelineLayout() {
		const visibilityPipelineLayout = this._device.createPipelineLayout({
			label: "Visibility pipeline layout",
			bindGroupLayouts: [
				this._bindGroupLayouts.camera,
				this._bindGroupLayouts.mesh,
			],
		});

		return visibilityPipelineLayout;
	}

	#createBasePipelineLayout() {
		const basePipelineLayout = this._device.createPipelineLayout({
			label: "Base pipeline layout",
			bindGroupLayouts: [
				this._bindGroupLayouts.visibility,
			],
		});

		return basePipelineLayout;
	}

	#createVisibilityTexture() {
		const visibilityTexture = this._device.createTexture({
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "rg32uint",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
		});

		return visibilityTexture;
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
					view: this._textures.visibility.createView(),
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(this._renderPipelines.visibility);
		renderPass.setBindGroup(0, this._bindGroups.camera);
		renderPass.setVertexBuffer(0, this._buffers.vertex);
		renderPass.setIndexBuffer(this._buffers.index, "uint16");

		const geometries = this._scene.getGeometries();

		// One instanced indirect draw call per unique geometry
		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const geometryName = geometry.constructor.name;
			const indirectBufferOffset = i * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT;
			const meshBindGroup = this.#meshBindGroups[geometryName];

			// Bind the projection buffer for all meshes having that geometry
			renderPass.setBindGroup(1, meshBindGroup);

			// Draw with the same (offsetted) indirect buffer
			renderPass.drawIndexedIndirect(this._buffers.indirect, indirectBufferOffset);
		}

		renderPass.end();
	}

	/**
	 * @param {GPUCommandEncoder} commandEncoder
	 */
	#renderBasePass(commandEncoder) {
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: this._context.getCurrentTexture().createView(),
					loadOp: "clear",
					storeOp: "store",
				}
			],
		});
		renderPass.setPipeline(this._renderPipelines.base);
		renderPass.setBindGroup(0, this._bindGroups.visibility);
		renderPass.draw(6);
		renderPass.end();
	}
}