@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<storage> meshes: array<Mesh>;
// @group() @binding() var<storage> rasterBinData: array<vec2u>;

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
	@location(0) position: vec4f,
}

struct Output {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

const rasterBinData: array<vec2u, 1> = array(vec2u());
// override activeRasterBin: u32;

@vertex
fn main(input: Input) -> Output {
	let localTriangleIndex: u32 = input.vertexIndex / 3;
	let updatedVertexIndex: u32 = input.vertexIndex - localTriangleIndex * 3;

	// let triangleIndex: u32 = triangleRange.startOffset + localTriangleIndex;

	let meshProjection: mat4x4f = meshes[input.instanceIndex].projection;

	var output: Output;
	output.position = camera.viewProjection * meshProjection * input.position;
	output.instanceIndex = input.instanceIndex;
	output.triangleIndex = updatedVertexIndex;

	return output;
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