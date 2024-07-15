struct Input {
	@builtin(position) position: vec4f,
	// @location(0) @interpolate(flat) instanceIndex: u32,
	// @location(1) @interpolate(flat) vertexIndex: u32,
}

@fragment
fn main(input: Input) -> @location(0) vec4f {
	return vec4f(1);
}