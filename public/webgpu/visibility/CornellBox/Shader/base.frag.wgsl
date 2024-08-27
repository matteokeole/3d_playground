@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var depthTexture: texture_depth_2d;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct In {
	@builtin(position) position: vec4f,
}

@fragment
fn main(in: In) -> @location(0) vec4f {
	let position: vec2u = vec2u(in.position.xy);
	let visibility: u32 = textureLoad(visibilityTexture, position).r;
	let triangleIndex: u32 = visibility & 0x7f;
	let color: vec3f = intToColor(triangleIndex) * 0.8 + 0.2;

	return vec4f(color, 1);
}

fn intToColor(int: u32) -> vec3f {
	var hash: u32 = murmurMix(int);
	var color: vec3f = vec3f(
		f32((hash >>  0) & 255),
		f32((hash >>  8) & 255),
		f32((hash >> 16) & 255),
	);

	return color * (1.0f / 255.0f);
}

fn murmurMix(_hash: u32) -> u32 {
	var hash: u32 = _hash;

	hash ^= hash >> 16;
	hash *= 0x85ebca6b;
	hash ^= hash >> 13;
	hash *= 0xc2b2ae35;
	hash ^= hash >> 16;

	return hash;
}