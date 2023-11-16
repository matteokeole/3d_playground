@group(0) @binding(0) var<uniform> camera: Camera;

struct Camera {
	viewProjectionInverse: mat4x4f,
}

const VERTICES: array<vec3f, 3> = array(
	vec3f(0, 0, 110),
	vec3f(0, 100, 110),
	vec3f(100, 100, 110),
);

@vertex
fn main(@builtin(vertex_index) vertex_index: u32, @location(0) position: vec3f) -> @builtin(position) vec4f {
	let vertex: vec3f = position;
	// let vertex: vec3f = VERTICES[vertex_index];

	return camera.viewProjectionInverse * vec4f(vertex, 1);
}