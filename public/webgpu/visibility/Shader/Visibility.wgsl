@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(1) @binding(1) var<storage> indexBuffer: array<u32>;
@group(1) @binding(2) var<storage> clusters: array<Cluster>;
// @group(1) @binding(3) var<storage> geometries: array<Geometry>;
@group(2) @binding(0) var<storage> meshes: array<Mesh>;
// @group() @binding() var<storage> materials: array<Material>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct Cluster {
	meshIndex: u32,
}

// Unused
struct Geometry {
	triangleCount: u32,
}

struct Mesh {
	world: mat4x4f,
	// geometryIndex: u32,
	// materialIndex: u32,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) clusterIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}