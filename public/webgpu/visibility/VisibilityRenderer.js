import {Matrix4} from "../../../src/math/index.js";
import {WebGPURenderer} from "../../../src/Renderer/index.js";
import {Scene} from "../../../src/Scene/index.js";

/**
 * @typedef {Object} SceneMember
 * @property {Number} sizeBytes
 * @property {(f32View: Float32Array, u32View: Uint32Array, offsetInts: Number) => void} writer
 */

export class VisibilityRenderer extends WebGPURenderer {
	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		this._buffers.viewUniform = this.#createViewUniformBuffer();

		this._buffers.vertexStorage = this.#createVertexStorageBuffer();
		this._buffers.indexStorage = this.#createIndexStorageBuffer();
		this._buffers.clusterStorage = this.#createClusterStorageBuffer();
		this._buffers.normalStorage = this.#createNormalStorageBuffer();
		this._buffers.meshStorage = this.#createMeshStorageBuffer();
		this._buffers.geometryStorage = this.#createGeometryStorageBuffer();

		/* this._buffers.sceneUniform = this.#createSceneUniformBuffer([
			{
				sizeBytes: this.#getMaterialBufferSizeBytes(),
				writer: this.#writeMaterialBuffer,
			},
		]); */

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

	#createVisibilityRenderPipeline() {
		this._bindGroupLayouts.view = this.#createViewBindGroupLayout();
		this._bindGroupLayouts.geometry = this.#createGeometryBindGroupLayout();
		this._bindGroupLayouts.visibility = this.#createVisibilityBindGroupLayout();
		this._bindGroupLayouts.mesh = this.#createMeshBindGroupLayout();

		this._bindGroups.view = this.#createViewBindGroup();
		this._bindGroups.geometry = this.#createGeometryBindGroup();
		this._bindGroups.visibility = this.#createVisibilityBindGroup();
		this._bindGroups.mesh = this.#createMeshBindGroup();

		const visibilityPipelineLayout = this.#createVisibilityPipelineLayout();

		const visibilityRenderPipeline = this._device.createRenderPipeline({
			label: "Visibility",
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
			label: "Material",
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
			size:
				4  * Uint32Array.BYTES_PER_ELEMENT +
				16 * Float32Array.BYTES_PER_ELEMENT +
				4  * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		return viewUniformBuffer;
	}

	#createVertexStorageBuffer() {
		const vertexBuffer = this._scene.getClusteredMeshes().vertexBuffer;

		const vertexStorageBuffer = this._device.createBuffer({
			label: "Vertex buffer",
			size: vertexBuffer.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const vertexStorageBufferMap = new Float32Array(vertexStorageBuffer.getMappedRange());

		vertexStorageBufferMap.set(vertexBuffer);

		vertexStorageBuffer.unmap();

		return vertexStorageBuffer;
	}

	#createIndexStorageBuffer() {
		const indexBuffer = this._scene.getClusteredMeshes().indexBuffer;

		const indexStorageBuffer = this._device.createBuffer({
			label: "Index buffer",
			size: indexBuffer.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const indexStorageBufferMap = new Uint32Array(indexStorageBuffer.getMappedRange());

		indexStorageBufferMap.set(indexBuffer);

		indexStorageBuffer.unmap();

		return indexStorageBuffer;
	}

	#createGeometryIndirectBuffer() {
		const indicesPerCluster = 128 * 3;
		const clusterCount = this._scene.getClusteredMeshes().clusters.length;
		const firstIndex = 0;

		const indirectBuffer = this._device.createBuffer({
			label: "Geometry indirect",
			size: WebGPURenderer._INDIRECT_BUFFER_SIZE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
		const indirectBufferMap = new Uint32Array(indirectBuffer.getMappedRange());

		// indexCount (IndexCountPerInstance) — The number of indices to draw.
		// instanceCount (InstanceCount) — The number of instances to draw.
		// firstIndex (StartIndexLocation) — Offset into the index buffer, in indices, begin drawing from.
		// baseVertex (BaseVertexLocation) — Added to each index value before indexing into the vertex buffers.
		// firstInstance (StartInstanceLocation) — First instance to draw.

		// Instance = Cluster
		indirectBufferMap[0] = indicesPerCluster; // The number of indices per instance to draw
		indirectBufferMap[1] = clusterCount; // The number of instances to draw
		indirectBufferMap[2] = firstIndex; // Offset into the index buffer, in indices, to begin drawing from

		indirectBuffer.unmap();

		return indirectBuffer;
	}

	#createNormalStorageBuffer() {
		const geometries = this._scene.getGeometries();
		let normalComponentCount = 0;

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const normals = geometry.getNormals();

			if (normals.length === 0) {
				console.warn("Found geometry without normals.");

				const normalStorageBuffer = this._device.createBuffer({
					label: "Normal",
					size: 3 * Float32Array.BYTES_PER_ELEMENT,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				});

				return normalStorageBuffer;
			}

			normalComponentCount += geometry.getNormals().length;
		}

		const normalStorageBuffer = this._device.createBuffer({
			label: "Normal buffer",
			size: normalComponentCount * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = normalStorageBuffer.getMappedRange();
		const viewAsF32 = new Float32Array(mappedRange);

		let offset = 0;

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const normals = geometry.getNormals();

			viewAsF32.set(normals, offset);

			offset += normals.length;
		}

		normalStorageBuffer.unmap();

		return normalStorageBuffer;
	}

	#createClusterStorageBuffer() {
		const clusteredMeshes = this._scene.getClusteredMeshes();

		const clusterStorageBuffer = this._device.createBuffer({
			label: "Cluster",
			size: clusteredMeshes.clusters.length * 2 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = clusterStorageBuffer.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);

		for (let i = 0; i < clusteredMeshes.clusters.length; i++) {
			const cluster = clusteredMeshes.clusters[i];

			viewAsU32[i * 2 + 0] = cluster.meshIndex;

			/**
			 * @todo Write material index
			 */
			// viewAsU32[i * 2 + 1] = 0;
		}

		clusterStorageBuffer.unmap();

		return clusterStorageBuffer;
	}

	#createGeometryStorageBuffer() {
		const geometries = this._scene.getGeometries();

		const geometryStorageBuffer = this._device.createBuffer({
			label: "Geometry",
			size: geometries.length * 2 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const geometryStorageBufferMap = new Uint32Array(geometryStorageBuffer.getMappedRange());
		let vertexOffset = 0;
		let normalOffset = 0;

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];

			geometryStorageBufferMap[i * 2 + 0] = vertexOffset;
			geometryStorageBufferMap[i * 2 + 1] = normalOffset;

			vertexOffset += geometry.getVertices().length / 3;
			normalOffset += geometry.getNormals().length;
		}

		geometryStorageBuffer.unmap();

		return geometryStorageBuffer;
	}

	#createMeshStorageBuffer() {
		const meshes = this._scene.getMeshes();

		const meshStorageBuffer = this._device.createBuffer({
			label: "Mesh",
			size: meshes.length * 20 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = meshStorageBuffer.getMappedRange();
		const meshStorageBufferMap = new Float32Array(mappedRange);

		/**
		 * @todo Refactor 2 different buffer views
		 */
		// Set mesh world
		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			meshStorageBufferMap.set(mesh.getWorld(), i * 20);
		}

		const meshStorageBufferMap2 = new Uint32Array(mappedRange);

		// Set mesh geometry index
		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			meshStorageBufferMap2[i * 20 + 16] = mesh.getGeometryIndex();
		}

		meshStorageBuffer.unmap();

		return meshStorageBuffer;
	}

	/**
	 * @param {SceneMember[]} sceneMembers
	 */
	#createSceneUniformBuffer(sceneMembers) {
		const sceneMemberOffsets = new Array(sceneMembers.length).fill(0);
		let memberOffsetBytes = 0;

		// Calculate scene member offset and total scene size
		{
			for (let memberIndex = 0; memberIndex < sceneMembers.length; memberIndex++) {
				sceneMemberOffsets[memberIndex] = memberOffsetBytes;

				const member = sceneMembers[memberIndex];
				const memberSizeBytes = member.sizeBytes;

				memberOffsetBytes = memberOffsetBytes + memberSizeBytes;
			}
		}

		const sceneSizeBytes = memberOffsetBytes;

		const sceneUniformBuffer = this._device.createBuffer({
			label: "Scene",
			size: sceneSizeBytes,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = sceneUniformBuffer.getMappedRange();
		const f32View = new Float32Array(mappedRange);
		const u32View = new Uint32Array(mappedRange);

		for (let memberIndex = 0; memberIndex < sceneMembers.length; memberIndex++) {
			const member = sceneMembers[memberIndex];
			const writer = member.writer;
			const memberOffsetBytes = sceneMemberOffsets[memberIndex];
			const memberOffsetInt = memberOffsetBytes * Uint32Array.BYTES_PER_ELEMENT; // Used for both f32 and u32

			writer.call(this, f32View, u32View, memberOffsetInt);
		}

		// Unmap
		sceneUniformBuffer.unmap();

		debugger;

		return sceneUniformBuffer;
	}

	#getMaterialBufferSizeBytes() {
		const materials = this._scene.getMaterials();

		return 1 * Uint32Array.BYTES_PER_ELEMENT * materials.length;
	}

	/**
	 * @param {Float32Array} f32View
	 * @param {Uint32Array} u32View
	 * @param {Number} offsetInts
	 */
	#writeMaterialBuffer(f32View, u32View, offsetInts) {
		const materials = this._scene.getMaterials();

		for (let materialIndex = 0; materialIndex < materials.length; materialIndex++) {
			u32View[offsetInts + materialIndex] = materialIndex;
		}
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
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				{
					binding: 3,
					visibility: GPUShaderStage.FRAGMENT,
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
			label: "Mesh",
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
				},
				{
					binding: 1,
					resource: {
						buffer: this._buffers.indexStorage,
					},
				},
				{
					binding: 2,
					resource: {
						buffer: this._buffers.clusterStorage,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: this._buffers.normalStorage,
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

	#createMeshBindGroup() {
		const meshBindGroup = this._device.createBindGroup({
			label: "Mesh bind group",
			layout: this._bindGroupLayouts.mesh,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this._buffers.meshStorage,
					},
				},
				{
					binding: 1,
					resource: {
						buffer: this._buffers.geometryStorage,
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
				this._bindGroupLayouts.mesh,
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
		const viewport = new Uint32Array(this.getViewport());

		this._device.queue.writeBuffer(this._buffers.viewUniform, 0, viewport);
	}

	#writeCameraUniformBuffer() {
		const viewProjection = this._camera.getViewProjection();
		const position = this._camera.getPosition();

		this._device.queue.writeBuffer(this._buffers.viewUniform, 4 * Uint32Array.BYTES_PER_ELEMENT, viewProjection);
		this._device.queue.writeBuffer(this._buffers.viewUniform, 4 * Uint32Array.BYTES_PER_ELEMENT + 16 * Float32Array.BYTES_PER_ELEMENT, position);
	}

	/**
	 * @param {Number} index
	 * @param {Matrix4} world
	 */
	writeMeshWorld(index, world) {
		this._device.queue.writeBuffer(this._buffers.meshStorage, index * 20 * Float32Array.BYTES_PER_ELEMENT, world);
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
		renderPass.setBindGroup(2, this._bindGroups.mesh);

		renderPass.drawIndirect(this._buffers.indirect, 0);

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
		renderPass.setBindGroup(3, this._bindGroups.mesh);
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