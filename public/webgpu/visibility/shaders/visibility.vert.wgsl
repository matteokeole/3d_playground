@group(0) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(0) @binding(1) var<storage> indexBuffer: array<u32>;
@group(0) @binding(2) var<storage> geometry: Geometry;
@group(1) @binding(0) var<storage> instances: array<Mesh>;
@group(2) @binding(0) var<uniform> camera: Camera;
// @group() @binding() var<storage> rasterBinData: array<vec2u>;

struct Geometry {
	triangleCount: u32,
}

struct Mesh {
	projection: mat4x4f,
}

struct Camera {
	viewProjection: mat4x4f,
}

struct TriangleRange {
	startOffset: u32,
	count: u32,
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

const geometryTriangleCount = 3;
const rasterBinData: array<vec2u, 1> = array(vec2u());
// override activeRasterBin: u32;

@vertex
fn main(input: Input) -> Output {
	let index: u32 = indexBuffer[input.vertexIndex];
	let vertex: vec4f = fetchVertex(index);

	let instanceTriangleIndex: u32 = input.vertexIndex / 3;
	let triangleOffset: u32 = input.instanceIndex * geometry.triangleCount;
	let triangleIndex: u32 = triangleOffset + instanceTriangleIndex;

	let instanceProjection: mat4x4f = instances[input.instanceIndex].projection;

	var output: Output;
	output.position = camera.viewProjection * instanceProjection * vertex;
	output.instanceIndex = input.instanceIndex;
	output.triangleIndex = instanceTriangleIndex;

	return output;
}

fn fetchVertex(index: u32) -> vec4f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];
	let vertex: vec3f = vec3f(x, y, z);

	return vec4f(vertex, 1);
}

fn getTriangleRange(instanceIndex: u32) -> TriangleRange {
	let rasterBin: vec2u = fetchRasterBin(instanceIndex);

	var range: TriangleRange;
	range.startOffset = rasterBin.x;
	range.count = rasterBin.y - rasterBin.x;

	return range;
}

fn fetchRasterBin(instanceIndex: u32) -> vec2u {
	let packedData: vec2u = rasterBinData[instanceIndex];
	let rangeStartOffset: u32 = packedData.y >> 16u;
	let rangeEndOffset: u32 = packedData.y & 0xffffu;

	return vec2u(rangeStartOffset, rangeEndOffset);
}