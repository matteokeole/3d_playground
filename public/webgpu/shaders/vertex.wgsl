@group(0) @binding(0) var<uniform> camera: Camera;

struct Vertex {
	@builtin(vertex_index) index: u32,
	@location(0) position0: vec3f,
	@location(1) position1: vec3f,
	@location(2) position2: vec3f,
	@location(3) position3: vec3f,
	@location(4) textureIndex: u32,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
	@location(1) @interpolate(flat) textureIndex: u32,
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
	var vertices: array<vec3f, 4> = array(
		vertex.position0,
		vertex.position1,
		vertex.position2,
		vertex.position3,
	);
	let position: vec3f = vertices[vertex.index];

	var output: VertexOutput;
	output.position = camera.viewProjection * vec4f(position, 1);
	output.uv = UV[vertex.index % 4];
	output.textureIndex = vertex.textureIndex;

	return output;
}