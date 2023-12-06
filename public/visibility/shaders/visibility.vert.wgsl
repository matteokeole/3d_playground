@group(0) @binding(0) var<storage> meshes: array<Mesh>;
@group(1) @binding(0) var<uniform> camera: Camera;

struct Mesh {
	projection: mat4x4f,
}

struct Camera {
	viewProjection: mat4x4f,
}

struct Input {
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex: u32,
	@location(0) position: vec4f,
}

struct Output {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) visibility: u32,
}

@vertex
fn main(input: Input) -> Output {
	let meshProjection: mat4x4f = meshes[input.instanceIndex].projection;

	var output: Output;
	output.position = camera.viewProjection * meshProjection * input.position;
	// output.visibility = ((input.vertexIndex) << 10) | input.instanceIndex;
	output.visibility = input.vertexIndex;

	return output;
}