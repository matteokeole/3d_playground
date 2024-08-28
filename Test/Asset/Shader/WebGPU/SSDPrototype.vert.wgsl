@group(0) @binding(0) var<uniform> camera: Camera;

struct Vertex {
	@builtin(vertex_index) index: u32,
	@location(0) position0: vec3f,
	@location(1) position1: vec3f,
	@location(2) position2: vec3f,
	@location(3) position3: vec3f,
	@location(4) textureMatrix0: vec3f,
	@location(5) textureMatrix1: vec3f,
	@location(6) textureMatrix2: vec3f,
	@location(7) textureIndex: f32,
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
	let position: vec3f = getVertexPosition(vertex);

	var output: VertexOutput;
	output.position = camera.viewProjection * vec4f(position, 1);
	output.uv = UV[vertex.index];
	output.textureIndex = u32(vertex.textureIndex);
	output.textureMatrix0 = vertex.textureMatrix0;
	output.textureMatrix1 = vertex.textureMatrix1;
	output.textureMatrix2 = vertex.textureMatrix2;

	return output;
}

fn getVertexPosition(vertex: Vertex) -> vec3f {
	var vertices: array<vec3f, 4> = array(
		vertex.position0,
		vertex.position1,
		vertex.position2,
		vertex.position3,
	);

	return vertices[vertex.index];
}