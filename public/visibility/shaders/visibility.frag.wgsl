struct Input {
	@builtin(position) position: vec4f,
}

@fragment
fn main(input: Input) -> @location(0) vec4f {
	return vec4f(1);
}