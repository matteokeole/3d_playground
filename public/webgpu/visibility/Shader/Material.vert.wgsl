const VERTICES: array<vec2f, 6> = array(
	vec2f(-1,  1),
	vec2f( 1,  1),
	vec2f(-1, -1),
	vec2f(-1, -1),
	vec2f( 1,  1),
	vec2f( 1, -1),
);

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
	let vertex: vec2f = VERTICES[vertexIndex];

	return vec4f(vertex, 0, 1);
}