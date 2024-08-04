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

struct Input {
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex: u32,
}

struct Output {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

@vertex
fn main(input: Input) -> Output {
	let index: u32 = indexBuffer[input.vertexIndex];
	let vertex: vec3f = fetchVertex(index);

	let instanceTriangleIndex: u32 = input.vertexIndex / 3;
	let triangleOffset: u32 = input.instanceIndex * geometry.triangleCount;
	let triangleIndex: u32 = triangleOffset + instanceTriangleIndex;

	let instance: Instance = instances[input.instanceIndex];

	var output: Output;
	output.position = view.viewProjection * instance.projection * vec4f(vertex, 1);
	output.instanceIndex = input.instanceIndex;
	output.triangleIndex = instanceTriangleIndex;

	return output;
}

fn fetchVertex(index: u32) -> vec3f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];
	let vertex: vec3f = vec3f(x, y, z);

	return vertex;
}