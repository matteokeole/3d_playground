@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

struct VertexOutput {
	// @location(0) @interpolate(flat) index: u32,
	@builtin(position) position: vec4f,
	@location(1) uv: vec2f,
}

@fragment
fn main(input: VertexOutput) -> @location(0) vec4f {
	return textureSample(texture, texture_sampler, input.uv);
}