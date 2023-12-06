struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) vertexIndex: u32,
}

const n: f32 = 3;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let visibility: f32 = f32(((input.instanceIndex << 23) & 0x7f800000) | ((input.vertexIndex % 3) & 0x007fffff));

	return vec4f(vec3f(visibility) / n + 1 / n, 0);
}