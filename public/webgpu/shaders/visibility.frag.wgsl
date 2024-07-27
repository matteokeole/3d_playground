struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) -> @location(0) vec2u {
	let visibility: u32 = 1;
	let depth: u32 = u32(input.position.w * far);

	return vec2u(visibility, depth);
}