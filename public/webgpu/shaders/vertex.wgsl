@group(0) @binding(0) var<uniform> camera: Camera;

struct Vertex {
	@builtin(vertex_index) index: u32,
	@location(0) position: vec3f,
}

struct Camera {
	viewProjectionInverse: mat4x4f,
}

const VERTICES: array<vec3f, 3> = array(
	vec3f(0, 0, -110),
	vec3f(0, 100, -110),
	vec3f(100, 100, -110),
);

@vertex
fn main(vertex: Vertex) -> @builtin(position) vec4f {
	let position: vec3f = vertex.position;
	// let position: vec3f = VERTICES[vertex.index];

	return camera.viewProjectionInverse * vec4f(position, 1);
}