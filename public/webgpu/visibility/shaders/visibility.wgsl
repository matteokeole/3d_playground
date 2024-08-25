@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(1) @binding(1) var<storage> indexBuffer: array<u32>;
@group(1) @binding(2) var<storage> geometry: Geometry;
@group(2) @binding(0) var<storage> instances: array<Instance>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct Geometry {
	triangleCount: u32,
}

struct Instance {
	projection: mat4x4f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}