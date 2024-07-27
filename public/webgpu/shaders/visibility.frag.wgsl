struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let index: u32 = input.triangleIndex;
	var color: vec4f = vec4f(1);

	if (index == 0) {
		color.g = 0;
		color.b = 0;
	}

	if (index == 1) {
		color.r = 0;
		color.b = 0;
	}

	if (index == 2) {
		color.r = 0;
		color.g = 0;
	}

	return color;
}