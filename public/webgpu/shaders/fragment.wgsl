struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) index: u32,
}

@fragment
fn main(input: VertexOutput) -> @location(0) vec4f {
	let r: f32 = f32(255 - input.index) / 255;
	let g: f32 = f32(255 - input.index - 50) / 255;
	let b: f32 = f32(255 - input.index - 100) / 255;

	return vec4f(r, g, b, 1);
}