@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(1) @binding(1) var<storage> indexBuffer: array<u32>;
@group(1) @binding(2) var<storage> clusterBuffer: array<Cluster>;
@group(2) @binding(0) var<storage> meshBuffer: array<Mesh>;
@group(2) @binding(1) var<storage> geometryBuffer: array<Geometry>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
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
	vertexBufferOffset: u32, // Offset in indices where the geometry starts in the vertex buffer
	normalBufferOffset: u32,
}

struct VertexInput {
	@builtin(instance_index) clusterIndex: u32,
	@builtin(vertex_index) localVertexIndex: u32,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) clusterIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = 3 * TRIANGLES_PER_CLUSTER;
const VISIBILITY_CLUSTER_MASK: u32 = 7;