@group(0) @binding(0) var<uniform> camera: Camera;

struct Vertex {
	@builtin(vertex_index) index: u32,
	@location(0) position: vec3f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) index: u32,
}

struct Camera {
	viewProjection: mat4x4f,
}

@vertex
fn main(vertex: Vertex) -> VertexOutput {
	var output: VertexOutput;
	output.position = camera.viewProjection * vec4f(vertex.position, 1);
	output.index = vertex.index;

	return output;
}