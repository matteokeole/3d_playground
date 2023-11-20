@group(0) @binding(0) var<uniform> camera: Camera;

struct Vertex {
	@builtin(vertex_index) index: u32,
	@location(0) position: vec3f,
}

struct VertexOutput {
	// @location(0) @interpolate(flat) index: u32,
	@builtin(position) position: vec4f,
	@location(1) uv: vec2f,
}

struct Camera {
	viewProjection: mat4x4f,
}

const UV: array<vec2f, 4> = array(
	vec2f(0, 1),
	vec2f(0, 0),
	vec2f(1, 0),
	vec2f(1, 1),
);

@vertex
fn main(vertex: Vertex) -> VertexOutput {
	var output: VertexOutput;
	// output.index = vertex.index;
	output.position = camera.viewProjection * vec4f(vertex.position, 1);
	output.uv = UV[vertex.index % 4];

	return output;
}