@group(0) @binding(0) var visibilityTexture: texture_2d<u32>;
@group(0) @binding(1) var visibilitySampler: sampler;

struct Input {
	@builtin(position) position: vec4f,
}

const far: f32 = 100;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let uv: vec2u = vec2u(input.position.xy);

	let visibility: vec2u = textureLoad(visibilityTexture, uv, 0).xy;
	let depth: f32 = f32(visibility.g) / far;

	return vec4f(depth);
}