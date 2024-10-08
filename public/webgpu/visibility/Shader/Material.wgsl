@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var<uniform> scene: Scene;

/* Scene {
	GPUScene {
		float4 GPUScenePrimitiveSceneData[]
		float4 GPUSceneInstanceSceneData[]
		float4 GPUSceneInstancePayloadData[]
		float4 GPUSceneLightmapData[]
		FLightSceneData GPUSceneLightData[]
		uint GPUSceneFrameNumber
		uint NumInstances
		uint NumScenePrimitives
		uint InstanceDataSOAStride
	}

	NaniteMaterials {
		uint PrimitiveMaterialElementStride
		uint PrimitiveMaterialData[]
		uint MaterialData[]
	}
} */

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
}

///
/// Full representation of the scene in GPU memory
///
struct Scene {
	vertexBuffer: array<f32>,
	indexBuffer: array<u32>,
	clusterBuffer: array<Cluster>,
	geometryBuffer: array<Geometry>,
	meshBuffer: array<Mesh>,
	materialBuffer: array<Material>,
}

struct Cluster {
	meshIndex: u32,
	materialIndex: u32,
}

struct Mesh {
	world: mat4x4f,
	geometryIndex: u32,
}

struct Geometry {
	vertexBufferOffset: u32, // Offset in indices where the geometry starts in the vertex position buffer
	normalBufferOffset: u32, // Offset in indices where the geometry starts in the vertex normal buffer
	normalCount: u32,
}

struct Material {
	index: u32,
}

const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = 3 * TRIANGLES_PER_CLUSTER;
const VISIBILITY_CLUSTER_MASK: u32 = 7;

///
/// Loads a material from the scene material buffer.
///
fn loadMaterial(offset: u32) -> Material {
	let material: Material = scene.materialBuffer[offset];

	return material;
}