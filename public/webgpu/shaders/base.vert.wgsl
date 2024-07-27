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
	var output: Output;
	output.position = vec4f(vertices[input.vertexIndex], 0, 1);

	return output;
}