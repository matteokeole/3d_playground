@group(0) @binding(1) var texture: texture_2d_array<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
	@location(1) @interpolate(flat) textureIndex: u32,
	// @location(2) @interpolate(flat) normalMapIndex: u32,
}

@fragment
fn main(input: VertexOutput) -> @location(0) vec4f {
	return textureSample(texture, texture_sampler, input.uv, input.textureIndex);
}