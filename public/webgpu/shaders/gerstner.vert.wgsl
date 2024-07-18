@group(0) @binding(0) var<uniform> camera: Camera;

struct Camera {
	viewProjection: mat4x4f,
}

struct Input {
	@location(0) position: vec4f,
}

struct Output {
	@builtin(position) position: vec4f,
}

@vertex
fn main(input: Input) -> Output {
	var output: Output;
	output.position = camera.viewProjection * input.position;

	return output;
}