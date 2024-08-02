struct Input {
	@builtin(vertex_index) vertexIndex: u32,
}

struct Output {
	@builtin(position) position: vec4f,
}

const vertices: array<vec2f, 6> = array(
	vec2f(-1,  1),
	vec2f( 1,  1),
	vec2f(-1, -1),
	vec2f(-1, -1),
	vec2f( 1,  1),
	vec2f( 1, -1),
);

@vertex
fn main(input: Input) -> Output {
	let vertex: vec2f = vertices[input.vertexIndex];

	var output: Output;
	output.position = vec4f(vertex, 0, 1);

	return output;
}