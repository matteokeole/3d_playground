@group(0) @binding(1) var texture: texture_2d_array<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

@fragment
fn main(input: VertexOutput) -> @location(0) vec4f {
	let textureMatrix: mat3x3f = mat3x3f(input.textureMatrix0, input.textureMatrix1, input.textureMatrix2);

	let uv: vec2f = (textureMatrix * vec3f(input.uv, 1)).xy;

	return textureSample(texture, texture_sampler, uv, input.textureIndex);
}