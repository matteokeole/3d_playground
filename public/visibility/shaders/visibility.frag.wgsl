struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) visibility: u32,
}

const n: f32 = 6 * 3 * 3;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	return vec4f(vec3f(f32(input.visibility) / n + 1 / n), 0);
}