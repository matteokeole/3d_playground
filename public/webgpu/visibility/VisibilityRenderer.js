import {Geometry} from "../../../src/Geometry/Geometry.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {WebGPURenderer} from "../../../src/Renderer/index.js";
import {Scene} from "../../../src/Scene/index.js";

export class VisibilityRenderer extends WebGPURenderer {
	/**
	 * @type {Map.<Geometry, GPUBuffer>}
	 */
	#meshStorageBuffers;

	/**
	 * @type {Map.<Geometry, GPUBindGroup>}
	 */
	#meshBindGroups;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);

		this.#meshStorageBuffers = new Map();
		this.#meshBindGroups = new Map();
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		this._buffers.viewUniform = this.#createViewUniformBuffer();

		this._buffers.vertexStorage = this.#createVertexStorageBuffer();
		this._buffers.indexStorage = this.#createIndexStorageBuffer();
		this._buffers.geometryStorage = this.#createGeometryStorageBuffer();

		this._buffers.indirect = this.#createGeometryIndirectBuffer();

		this._buffers.visibility = this.#createVisibilityBuffer();
		this._buffers.depth = this.#createDepthBuffer();

		this._textures.depth = this.#createDepthTexture();
		this._textures.depthStencil = this.#createDepthStencilTexture();
		this._textures.visibility = this.#createVisibilityTexture();

		this._renderPipelines.visibility = this.#createVisibilityRenderPipeline();
		this._renderPipelines.material = this.#createMaterialRenderPipeline();
		// this._computePipelines.clear = this.#createClearComputePipeline();
	}

	render() {
		this.#writeViewUniformBuffer();
		this.#writeCameraUniformBuffer();

		const commandEncoder = this._device.createCommandEncoder();

		this.#renderVisibilityPass(commandEncoder);
		this.#renderMaterialPass(commandEncoder);
		// this.#computeClearPass(commandEncoder);

		const commandBuffer = commandEncoder.finish();

		this._device.queue.submit([commandBuffer]);
	}

	/**
	 * @param {Mesh} mesh
	 * @returns {?GPUBuffer}
	 */
	getMeshBuffer(mesh) {
		const geometry = mesh.getGeometry();
		const buffer = this.#meshStorageBuffers.get(geometry);

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

	#createVisibilityRenderPipeline() {
		this._bindGroupLayouts.view = this.#createViewBindGroupLayout();
		this._bindGroupLayouts.geometry = this.#createGeometryBindGroupLayout();
		this._bindGroupLayouts.visibility = this.#createVisibilityBindGroupLayout();
		this._bindGroupLayouts.mesh = this.#createMeshBindGroupLayout();

		const geometries = this._scene.getGeometries();

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const meshes = this._scene.getMeshesByGeometry(geometry);

			const meshStorageBuffer = this.#createMeshStorageBuffer(meshes);
			const meshBindGroup = this.#createMeshBindGroup(meshStorageBuffer);

			this.#meshStorageBuffers.set(geometry, meshStorageBuffer);
			this.#meshBindGroups.set(geometry, meshBindGroup);
		}

		this._bindGroups.view = this.#createViewBindGroup();
		this._bindGroups.geometry = this.#createGeometryBindGroup();
		this._bindGroups.visibility = this.#createVisibilityBindGroup();

		const visibilityPipelineLayout = this.#createVisibilityPipelineLayout();

		const visibilityRenderPipeline = this._device.createRenderPipeline({
			layout: visibilityPipelineLayout,
			vertex: {
				module: this.getShader("visibility").getVertexShaderModule(),
				entryPoint: "main",
			},
			primitive: {
				topology: "triangle-list",
				frontFace: "cw",
				cullMode: "back",
			},
			depthStencil: {
				format: "depth24plus",
				depthWriteEnabled: true,
				depthCompare: "less",
			},
			fragment: {
				module: this.getShader("visibility").getFragmentShaderModule(),
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

	#createMaterialRenderPipeline() {
		this._bindGroupLayouts.materialVisibility = this.#createMaterialVisibilityBindGroupLayout();

		this._bindGroups.materialVisibility = this.#createMaterialVisibilityBindGroup();

		const materialPipelineLayout = this.#createMaterialPipelineLayout();

		const materialRenderPipeline = this._device.createRenderPipeline({
			layout: materialPipelineLayout,
			vertex: {
				module: this.getShader("material").getVertexShaderModule(),
				entryPoint: "main",
			},
			primitive: {
				topology: "triangle-list",
				frontFace: "cw",
				cullMode: "back",
			},
			fragment: {
				module: this.getShader("material").getFragmentShaderModule(),
				entryPoint: "main",
				targets: [
					{
						format: this._preferredCanvasFormat,
						blend: {
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
						},
					},
				],
			},
		});

		return materialRenderPipeline;
	}

	/* #createClearComputePipeline() {
		this._bindGroupLayouts.clear = this.#createClearBindGroupLayout();

		this._bindGroups.clear = this.#createClearBindGroup();

		const clearComputePipelineLayout = this.#createClearComputePipelineLayout();

		const clearComputePipeline = this._device.createComputePipeline({
			layout: clearComputePipelineLayout,
			compute: {
				module: this._shaderModules.clearCompute,
				entryPoint: "main",
			},
		});

		return clearComputePipeline;
	} */

	#createViewUniformBuffer() {
		const viewUniformBuffer = this._device.createBuffer({
			label: "View uniform",
			size: 20 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		return viewUniformBuffer;
	}

	#createVertexStorageBuffer() {
		const meshes = this._scene.getMeshes();
		let vertexCount = 0;

		for (let i = 0; i < meshes.length; i++) {
			vertexCount += meshes[i].getGeometry().getVertices().length;
		}

		const vertexStorageBuffer = this._device.createBuffer({
			label: "Vertex buffer",
			size: vertexCount * Float32Array.BYTES_PER_ELEMENT, // Why not * 3?
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const vertexStorageBufferMap = new Float32Array(vertexStorageBuffer.getMappedRange());

		for (let i = 0, offset = 0; i < meshes.length; i++) {
			const vertices = meshes[i].getGeometry().getVertices();

			vertexStorageBufferMap.set(vertices, offset);

			offset += vertices.length;
		}

		vertexStorageBuffer.unmap();

		return vertexStorageBuffer;
	}

	#createIndexStorageBuffer() {
		const meshes = this._scene.getMeshes();
		let indexCount = 0;

		for (let i = 0; i < meshes.length; i++) {
			indexCount += meshes[i].getGeometry().getIndices().length;
		}

		const indexStorageBuffer = this._device.createBuffer({
			label: "Index buffer",
			size: indexCount * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const indexStorageBufferMap = new Uint32Array(indexStorageBuffer.getMappedRange());

		for (let i = 0, previousIndexCount = 0, previousVertexCount = 0; i < meshes.length; i++) {
			const indices = meshes[i].getGeometry().getIndices();

			for (let j = 0; j < indices.length; j++) {
				indexStorageBufferMap[previousIndexCount + j] = previousVertexCount + indices[j];
			}

			previousIndexCount += indices.length;
			previousVertexCount += meshes[i].getGeometry().getVertices().length / 3;
		}

		indexStorageBuffer.unmap();

		return indexStorageBuffer;
	}

	#createGeometryIndirectBuffer() {
		const geometries = this._scene.getGeometries();

		const indirectBuffer = this._device.createBuffer({
			label: "Geometry indirect",
			size: geometries.length * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
		const indirectBufferMap = new Uint32Array(indirectBuffer.getMappedRange());

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

	#createGeometryStorageBuffer() {
		const geometries = this._scene.getGeometries();

		const geometryStorageBuffer = this._device.createBuffer({
			label: "Geometry",
			size: geometries.length * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const geometryStorageBufferMap = new Uint32Array(geometryStorageBuffer.getMappedRange());

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];

			geometryStorageBufferMap[i] = geometry.getTriangleCount();
		}

		geometryStorageBuffer.unmap();

		return geometryStorageBuffer;
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

	#createViewBindGroupLayout() {
		const viewBindGroupLayout = this._device.createBindGroupLayout({
			label: "View",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				},
			],
		});

		return viewBindGroupLayout;
	}

	#createGeometryBindGroupLayout() {
		const geometryBindGroupLayout = this._device.createBindGroupLayout({
			label: "Geometry bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
		});

		return geometryBindGroupLayout;
	}

	#createVisibilityBindGroupLayout() {
		const visibilityBindGroupLayout = this._device.createBindGroupLayout({
			label: "Visibility bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					storageTexture: {
						access: "read-write",
						format: "r32uint",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					storageTexture: {
						access: "write-only",
						format: "rg32uint",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "storage",
					},
				},
				{
					binding: 3,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "storage",
					},
				},
			],
		});

		return visibilityBindGroupLayout;
	}

	#createMaterialVisibilityBindGroupLayout() {
		const materialVisibilityBindGroupLayout = this._device.createBindGroupLayout({
			label: "Material visibility bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "depth",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					storageTexture: {
						access: "read-only",
						format: "rg32uint",
					},
				},
				/* {
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "storage",
					},
				},
				{
					binding: 3,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "storage",
					},
				}, */
			],
		});

		return materialVisibilityBindGroupLayout;
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

	/* #createClearBindGroupLayout() {
		const clearBindGroupLayout = this._device.createBindGroupLayout({
			label: "Clear",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: {
						access: "write-only",
						format: "r32uint",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: {
						access: "write-only",
						format: "rg32uint",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
					},
				},
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
					},
				},
			],
		});

		return clearBindGroupLayout;
	} */

	#createViewBindGroup() {
		const viewBindGroup = this._device.createBindGroup({
			label: "View",
			layout: this._bindGroupLayouts.view,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.viewUniform,
					},
				},
			],
		});

		return viewBindGroup;
	}

	#createGeometryBindGroup() {
		const geometryBindGroup = this._device.createBindGroup({
			label: "Geometry bind group",
			layout: this._bindGroupLayouts.geometry,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.vertexStorage,
					},
				}, {
					binding: 1,
					resource: {
						buffer: this._buffers.indexStorage,
					},
				}, {
					binding: 2,
					resource: {
						buffer: this._buffers.geometryStorage,
					},
				},
			],
		});

		return geometryBindGroup;
	}

	#createVisibilityBindGroup() {
		const visibilityBindGroup = this._device.createBindGroup({
			label: "Visibility",
			layout: this._bindGroupLayouts.visibility,
			entries: [
				{
					binding: 0,
					resource: this._textures.depth.createView(),
				},
				{
					binding: 1,
					resource: this._textures.visibility.createView(),
				},
				{
					binding: 2,
					resource: {
						buffer: this._buffers.depth,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: this._buffers.visibility,
					},
				},
			],
		});

		return visibilityBindGroup;
	}

	#createMaterialVisibilityBindGroup() {
		const materialVisibilityBindGroup = this._device.createBindGroup({
			label: "Material visibility",
			layout: this._bindGroupLayouts.materialVisibility,
			entries: [
				{
					binding: 0,
					resource: this._textures.depthStencil.createView(),
				},
				{
					binding: 1,
					resource: this._textures.visibility.createView(),
				},
				/* {
					binding: 2,
					resource: {
						buffer: this._buffers.depth,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: this._buffers.visibility,
					},
				}, */
			],
		});

		return materialVisibilityBindGroup;
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

	/* #createClearBindGroup() {
		const clearBindGroup = this._device.createBindGroup({
			label: "Clear",
			layout: this._bindGroupLayouts.clear,
			entries: [
				{
					binding: 0,
					resource: this._textures.depth.createView(),
				},
				{
					binding: 1,
					resource: this._textures.visibility.createView(),
				},
				{
					binding: 2,
					resource: {
						buffer: this._buffers.depth,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: this._buffers.visibility,
					},
				},
			],
		});

		return clearBindGroup;
	} */

	#createVisibilityPipelineLayout() {
		const visibilityPipelineLayout = this._device.createPipelineLayout({
			label: "Visibility render",
			bindGroupLayouts: [
				this._bindGroupLayouts.view,
				this._bindGroupLayouts.geometry,
				// this._bindGroupLayouts.visibility,
				this._bindGroupLayouts.mesh,
			],
		});

		return visibilityPipelineLayout;
	}

	#createMaterialPipelineLayout() {
		const materialPipelineLayout = this._device.createPipelineLayout({
			label: "Material render",
			bindGroupLayouts: [
				this._bindGroupLayouts.view,
				this._bindGroupLayouts.materialVisibility,
				this._bindGroupLayouts.geometry,
			],
		});

		return materialPipelineLayout;
	}

	/* #createClearComputePipelineLayout() {
		const clearComputePipelineLayout = this._device.createPipelineLayout({
			label: "Clear compute",
			bindGroupLayouts: [
				this._bindGroupLayouts.view,
				this._bindGroupLayouts.clear,
			],
		});

		return clearComputePipelineLayout;
	} */

	#createDepthTexture() {
		const depthTexture = this._device.createTexture({
			label: "Depth",
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "r32uint",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
		});

		return depthTexture;
	}

	#createDepthStencilTexture() {
		const depthStencilTexture = this._device.createTexture({
			label: "Depth stencil",
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "depth24plus",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
		});

		return depthStencilTexture;
	}

	#createVisibilityTexture() {
		const visibilityTexture = this._device.createTexture({
			label: "Visibility",
			size: {
				width: this._viewport[2],
				height: this._viewport[3],
			},
			format: "rg32uint",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
		});

		return visibilityTexture;
	}

	#createVisibilityBuffer() {
		const visibilityBuffer = this._device.createBuffer({
			label: "Visibility",
			size: this._viewport[2] * this._viewport[3] * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE,
		});

		return visibilityBuffer;
	}

	#createDepthBuffer() {
		const depthBuffer = this._device.createBuffer({
			label: "Depth",
			size: this._viewport[2] * this._viewport[3] * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE,
		});

		return depthBuffer;
	}

	#writeViewUniformBuffer() {
		const view = Uint32Array.of(0, 0, this._viewport[2], this._viewport[3]);

		this._device.queue.writeBuffer(this._buffers.viewUniform, 0, view);
	}

	#writeCameraUniformBuffer() {
		const viewProjection = this._camera.getViewProjection();

		this._device.queue.writeBuffer(this._buffers.viewUniform, 4 * Float32Array.BYTES_PER_ELEMENT, viewProjection);
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
			depthStencilAttachment: {
				view: this._textures.depthStencil.createView(),
				depthClearValue: 1,
				depthLoadOp: "clear",
				depthStoreOp: "store",
			},
		});
		renderPass.setPipeline(this._renderPipelines.visibility);
		renderPass.setBindGroup(0, this._bindGroups.view);
		renderPass.setBindGroup(1, this._bindGroups.geometry);
		// renderPass.setBindGroup(2, this._bindGroups.visibility);

		const geometries = this._scene.getGeometries();

		// One instanced indirect draw call per unique geometry
		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const indirectBufferOffset = i * WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT;
			const meshBindGroup = this.#meshBindGroups.get(geometry);

			// Bind the projection buffer for all meshes having that geometry
			renderPass.setBindGroup(2, meshBindGroup);

			// Draw with the same (offsetted) indirect buffer
			renderPass.drawIndirect(this._buffers.indirect, indirectBufferOffset);
		}

		renderPass.end();
	}

	/**
	 * @param {GPUCommandEncoder} commandEncoder
	 */
	#renderMaterialPass(commandEncoder) {
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: this._context.getCurrentTexture().createView(),
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(this._renderPipelines.material);
		renderPass.setBindGroup(0, this._bindGroups.view);
		renderPass.setBindGroup(1, this._bindGroups.materialVisibility);
		renderPass.setBindGroup(2, this._bindGroups.geometry);
		renderPass.draw(6);
		renderPass.end();
	}

	/**
	 * @param {GPUCommandEncoder} commandEncoder
	 */
	/* #computeClearPass(commandEncoder) {
		const computePass = commandEncoder.beginComputePass();
		computePass.setPipeline(this._computePipelines.clear);
		computePass.setBindGroup(0, this._bindGroups.view);
		computePass.setBindGroup(1, this._bindGroups.clear);

		const x = this._viewport[2] / 7;
		const y = this._viewport[3] / 7;

		computePass.dispatchWorkgroups(x, y, 1);
		computePass.end();
	} */
}