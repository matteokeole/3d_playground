import {Matrix4} from "../../../src/math/index.js";
import {WebGPURenderer} from "../../../src/Renderer/index.js";
import {Scene} from "../../../src/Scene/index.js";

/**
 * @typedef {Object} SceneMember
 * @property {Number} sizeBytes
 * @property {(f32View: Float32Array, u32View: Uint32Array, offsetInts: Number) => void} writer
 */

export class VisibilityRenderer extends WebGPURenderer {
	async build() {
		await super.build();

		await this.loadShader("materialCount", "public/webgpu/visibility/Shader/MaterialCount.wgsl",);
		await this.loadShader("materialStart", "public/webgpu/visibility/Shader/MaterialStart.wgsl",);
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		super.setScene(scene);

		scene.validate();

		this._buffers.viewUniform = this.#createViewUniformBuffer();

		this._buffers.vertexPositionStorage = this.#createVertexPositionBuffer();
		this._buffers.vertexNormalStorage = this.#createVertexNormalBuffer();
		this._buffers.indexStorage = this.#createIndexStorageBuffer();
		this._buffers.clusterStorage = this.#createClusterStorageBuffer();

		this._buffers.meshStorage = this.#createMeshStorageBuffer();
		this._buffers.geometryStorage = this.#createGeometryStorageBuffer();

		this._buffers.materialCount = this.#createMaterialCountBuffer();
		this._buffers.debugMaterialCount = this.#createDebugMaterialCountBuffer();
		this._buffers.materialStart = this.#createMaterialStartBuffer();
		this._buffers.debugMaterialStart = this.#createDebugMaterialStartBuffer();
		this._buffers.totalMaterialCount = this.#createTotalMaterialCountBuffer();

		/**
		 * @todo Group buffer within "Scene" uniform
		 */
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

		this._computePipelines.materialCount = this.#createMaterialCountComputePipeline();
		this._computePipelines.materialStart = this.#createMaterialStartComputePipeline();
	}

	async render() {
		this.setCanRender(false);

		this.#writeViewUniformBuffer();
		this.#writeCameraUniformBuffer();

		const commandEncoder = this._device.createCommandEncoder();

		this.#renderVisibilityPass(commandEncoder);
		this.#renderMaterialPass(commandEncoder);

		this.#computeMaterialCountPass(commandEncoder);
		this.#computeMaterialStartPass(commandEncoder);

		const commandBuffer = commandEncoder.finish();

		this._device.queue.submit([commandBuffer]);

		await this._device.queue.onSubmittedWorkDone();

		// Debug: Check material count buffer contents
		await this.#debugMaterialCount();

		// Debug: Check material start buffer contents
		await this.#debugMaterialStart();

		this.setCanRender(true);
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

	#createMaterialCountComputePipeline() {
		this._bindGroupLayouts.materialCount = this.#createMaterialCountBindGroupLayout();

		this._bindGroups.materialCount = this.#createMaterialCountBindGroup();

		const materialCountPipelineLayout = this.#createMaterialCountPipelineLayout();

		const materialCountPipeline = this._device.createComputePipeline({
			label: "Material count",
			layout: materialCountPipelineLayout,
			compute: {
				/**
				 * @todo Implement proper compute shader loading
				 * 
				 * For now single-file compute shaders can be loaded,
				 * and their source is available through both getVertexShaderModule()
				 * and getFragmentShaderModule()
				 */
				module: this.getShader("materialCount").getVertexShaderModule(),
				entryPoint: "main",
			},
		});

		return materialCountPipeline;
	}

	#createMaterialStartComputePipeline() {
		this._bindGroupLayouts.materialStart = this.#createMaterialStartBindGroupLayout();

		this._bindGroups.materialStart = this.#createMaterialStartBindGroup();

		const materialStartPipelineLayout = this.#createMaterialStartPipelineLayout();

		const materialStartPipeline = this._device.createComputePipeline({
			label: "Material start",
			layout: materialStartPipelineLayout,
			compute: {
				/**
				 * @todo Implement proper compute shader loading
				 * 
				 * For now single-file compute shaders can be loaded,
				 * and their source is available through both getVertexShaderModule()
				 * and getFragmentShaderModule()
				 */
				module: this.getShader("materialStart").getVertexShaderModule(),
				entryPoint: "main",
			},
		});

		return materialStartPipeline;
	}

	#createViewUniformBuffer() {
		const viewUniformBuffer = this._device.createBuffer({
			label: "View uniform",
			size:
				 4 * Uint32Array.BYTES_PER_ELEMENT +
				16 * Float32Array.BYTES_PER_ELEMENT +
				 4 * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		return viewUniformBuffer;
	}

	#createVertexPositionBuffer() {
		const vertexBuffer = this._scene.getClusteredMeshes().vertexPositionBuffer;

		const vertexPositionBuffer = this._device.createBuffer({
			label: "Vertex position",
			size: vertexBuffer.byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = vertexPositionBuffer.getMappedRange();
		const viewAsF32 = new Float32Array(mappedRange);

		viewAsF32.set(vertexBuffer);

		vertexPositionBuffer.unmap();

		return vertexPositionBuffer;
	}

	#createVertexNormalBuffer() {
		const normalBuffer = this._scene.getClusteredMeshes().vertexNormalBuffer;

		let byteLength = normalBuffer.byteLength;

		if (byteLength === 0) {
			// Avoid empty buffer
			byteLength = 3 * Float32Array.BYTES_PER_ELEMENT;
		}

		const vertexNormalBuffer = this._device.createBuffer({
			label: "Vertex normal",
			size: byteLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = vertexNormalBuffer.getMappedRange();
		const viewAsF32 = new Float32Array(mappedRange);

		viewAsF32.set(normalBuffer);

		vertexNormalBuffer.unmap();

		return vertexNormalBuffer;
	}

	#createIndexStorageBuffer() {
		const vertexPositionIndexBuffer = this._scene.getClusteredMeshes().vertexPositionIndexBuffer;
		const vertexNormalIndexBuffer = this._scene.getClusteredMeshes().vertexNormalIndexBuffer;
		const vertexCount = vertexPositionIndexBuffer.length;
		const VERTEX_STRIDE = 2;

		const vertexBuffer = this._device.createBuffer({
			label: "Index buffer",
			size: vertexCount * VERTEX_STRIDE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = vertexBuffer.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);

		for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
			viewAsU32[vertexIndex * VERTEX_STRIDE + 0] = vertexPositionIndexBuffer[vertexIndex];
			viewAsU32[vertexIndex * VERTEX_STRIDE + 1] = vertexNormalIndexBuffer[vertexIndex];
		}

		vertexBuffer.unmap();

		return vertexBuffer;
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
		const GEOMETRY_STRIDE = 3;

		const geometryStorageBuffer = this._device.createBuffer({
			label: "Geometry",
			size: geometries.length * GEOMETRY_STRIDE * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = geometryStorageBuffer.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);
		let vertexOffset = 0;
		let normalOffset = 0;

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];
			const vertexPositionCount = geometry.getPositions().length / 3;
			const vertexNormalCount = geometry.getNormals().length / 3;

			viewAsU32[i * GEOMETRY_STRIDE + 0] = vertexOffset;
			viewAsU32[i * GEOMETRY_STRIDE + 1] = normalOffset;
			viewAsU32[i * GEOMETRY_STRIDE + 2] = vertexNormalCount;

			vertexOffset += vertexPositionCount;
			normalOffset += vertexNormalCount;
		}

		geometryStorageBuffer.unmap();

		return geometryStorageBuffer;
	}

	#createMeshStorageBuffer() {
		const meshes = this._scene.getMeshes();
		const MESH_STRIDE = 20;

		const meshStorageBuffer = this._device.createBuffer({
			label: "Mesh",
			size: meshes.length * MESH_STRIDE * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		const mappedRange = meshStorageBuffer.getMappedRange();
		const viewAsF32 = new Float32Array(mappedRange);
		const viewAsU32 = new Uint32Array(mappedRange);

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			viewAsF32.set(mesh.getWorld(), i * MESH_STRIDE);
			viewAsU32[i * MESH_STRIDE + 16] = mesh.getGeometryIndex();
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
				// Vertex position
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				// Normal position
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				// Index
				{
					binding: 2,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				// Cluster
				{
					binding: 3,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
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
				// Depth texture
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "depth",
					},
				},
				// Visibility texture
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					storageTexture: {
						access: "read-only",
						format: "rg32uint",
					},
				},
			],
		});

		return materialVisibilityBindGroupLayout;
	}

	#createMeshBindGroupLayout() {
		const meshBindGroupLayout = this._device.createBindGroupLayout({
			label: "Mesh",
			entries: [
				// Mesh
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
				// Geometry
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

	#createMaterialCountBindGroupLayout() {
		const materialCountBindGroupLayout = this._device.createBindGroupLayout({
			label: "Material count",
			entries: [
				// Material count buffer
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
					},
				},
			],
		});

		return materialCountBindGroupLayout;
	}

	#createMaterialStartBindGroupLayout() {
		const materialStartBindGroupLayout = this._device.createBindGroupLayout({
			label: "Material start",
			entries: [
				// Material count buffer
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						/**
						 * @todo Atomics in "storage" address space must have "read_write" access mode
						 * Give "read_write" or copy data to an uniform buffer?
						 */
						type: "storage",
					},
				},
				// Material start buffer
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
					},
				},
				// Total material count buffer (helper)
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
		});

		return materialStartBindGroupLayout;
	}

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
						buffer: this._buffers.vertexPositionStorage,
					},
				},
				{
					binding: 1,
					resource: {
						buffer: this._buffers.vertexNormalStorage,
					},
				},
				{
					binding: 2,
					resource: {
						buffer: this._buffers.indexStorage,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: this._buffers.clusterStorage,
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

	#createMaterialCountBindGroup() {
		const materialCountBindGroup = this._device.createBindGroup({
			label: "Material count",
			layout: this._bindGroupLayouts.materialCount,
			entries: [
				// Material count buffer
				{
					binding: 0,
					resource: {
						buffer: this._buffers.materialCount,
					},
				},
			],
		});

		return materialCountBindGroup;
	}

	#createMaterialStartBindGroup() {
		const materialStartBindGroup = this._device.createBindGroup({
			label: "Material start",
			layout: this._bindGroupLayouts.materialStart,
			entries: [
				// Material count buffer
				{
					binding: 0,
					resource: {
						buffer: this._buffers.materialCount,
					},
				},
				// Material start buffer
				{
					binding: 1,
					resource: {
						buffer: this._buffers.materialStart,
					},
				},
				// Total material count buffer
				{
					binding: 2,
					resource: {
						buffer: this._buffers.totalMaterialCount,
					},
				},
			],
		});

		return materialStartBindGroup;
	}

	#createVisibilityPipelineLayout() {
		const visibilityPipelineLayout = this._device.createPipelineLayout({
			label: "Visibility",
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
			label: "Material",
			bindGroupLayouts: [
				this._bindGroupLayouts.view,
				this._bindGroupLayouts.materialVisibility,
				this._bindGroupLayouts.geometry,
				this._bindGroupLayouts.mesh,
			],
		});

		return materialPipelineLayout;
	}

	#createMaterialCountPipelineLayout() {
		const materialCountPipelineLayout = this._device.createPipelineLayout({
			label: "Material count",
			bindGroupLayouts: [
				this._bindGroupLayouts.view,
				this._bindGroupLayouts.materialVisibility,
				this._bindGroupLayouts.geometry,
				this._bindGroupLayouts.materialCount,
			],
		});

		return materialCountPipelineLayout;
	}

	#createMaterialStartPipelineLayout() {
		const materialStartPipelineLayout = this._device.createPipelineLayout({
			label: "Material start",
			bindGroupLayouts: [
				this._bindGroupLayouts.materialStart,
			],
		});

		return materialStartPipelineLayout;
	}

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

	#createMaterialCountBuffer() {
		const materials = this.getScene().getMaterials();

		const materialCountBuffer = this._device.createBuffer({
			label: "Material count",
			size: materials.length * 1 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
		});

		return materialCountBuffer;
	}

	#createDebugMaterialCountBuffer() {
		const debugMaterialCountBuffer = this._device.createBuffer({
			label: "Debug material count",
			size: this._buffers.materialCount.size,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
		});

		return debugMaterialCountBuffer;
	}

	#createMaterialStartBuffer() {
		const materialStartBuffer = this._device.createBuffer({
			label: "Material start",
			size: this._buffers.materialCount.size,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
		});

		return materialStartBuffer;
	}

	#createDebugMaterialStartBuffer() {
		const debugMaterialStartBuffer = this._device.createBuffer({
			label: "Debug material start",
			size: this._buffers.materialStart.size,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
		});

		return debugMaterialStartBuffer;
	}

	#createTotalMaterialCountBuffer() {
		const totalMaterialCountBuffer = this._device.createBuffer({
			label: "Total material count",
			size: 1 * Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
			mappedAtCreation: true,
		});

		const mappedRange = totalMaterialCountBuffer.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);

		viewAsU32[0] = this._buffers.materialCount.size / Uint32Array.BYTES_PER_ELEMENT;

		totalMaterialCountBuffer.unmap();

		return totalMaterialCountBuffer;
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
		const visibilityPass = commandEncoder.beginRenderPass({
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
		visibilityPass.setPipeline(this._renderPipelines.visibility);
		visibilityPass.setBindGroup(0, this._bindGroups.view);
		visibilityPass.setBindGroup(1, this._bindGroups.geometry);
		visibilityPass.setBindGroup(2, this._bindGroups.mesh);

		// 1. Render scene to visibility buffer
		// 2. Dispatch compute shaders for every pixel to determine which materials are visible
		// 3. Handle the visible materials
		// 4. Dispatch compute shaders for every pixel to handle light sources

		visibilityPass.drawIndirect(this._buffers.indirect, 0);

		visibilityPass.end();
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
	#computeMaterialCountPass(commandEncoder) {
		const materialCountPass = commandEncoder.beginComputePass();
		materialCountPass.setPipeline(this._computePipelines.materialCount);
		materialCountPass.setBindGroup(0, this._bindGroups.view);
		materialCountPass.setBindGroup(1, this._bindGroups.materialVisibility);
		materialCountPass.setBindGroup(2, this._bindGroups.geometry);
		materialCountPass.setBindGroup(3, this._bindGroups.materialCount);

		// Split screen into 8x8 tiles
		const x = (this._viewport[2] / 8) | 0;
		const y = (this._viewport[3] / 8) | 0;

		materialCountPass.dispatchWorkgroups(x, y, 1);
		materialCountPass.end();

		// Debug: Check material count buffer contents
		commandEncoder.copyBufferToBuffer(this._buffers.materialCount, 0, this._buffers.debugMaterialCount, 0, this._buffers.materialCount.size);
	}

	/**
	 * @param {GPUCommandEncoder} commandEncoder
	 */
	#computeMaterialStartPass(commandEncoder) {
		const materialStartPass = commandEncoder.beginComputePass();
		materialStartPass.setPipeline(this._computePipelines.materialStart);
		materialStartPass.setBindGroup(0, this._bindGroups.materialStart);

		materialStartPass.dispatchWorkgroups(1, 1, 1);
		materialStartPass.end();

		// Debug: Check material start buffer contents
		commandEncoder.copyBufferToBuffer(this._buffers.materialStart, 0, this._buffers.debugMaterialStart, 0, this._buffers.materialStart.size);
	}

	async #debugMaterialCount() {
		await this._buffers.debugMaterialCount.mapAsync(GPUMapMode.READ);

		const mappedRange = this._buffers.debugMaterialCount.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);

		// debugger;

		this._buffers.debugMaterialCount.unmap();
	}

	async #debugMaterialStart() {
		await this._buffers.debugMaterialStart.mapAsync(GPUMapMode.READ);

		const mappedRange = this._buffers.debugMaterialStart.getMappedRange();
		const viewAsU32 = new Uint32Array(mappedRange);

		// debugger;

		this._buffers.debugMaterialStart.unmap();
	}
}