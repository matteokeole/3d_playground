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

const NEAR: f32 = 1;
const FAR: f32 = 1000;
const VISUALIZATION_MODE_DEPTH: u32 = 0;
const VISUALIZATION_MODE_INSTANCE: u32 = 1;
const VISUALIZATION_MODE_TRIANGLE: u32 = 2;
const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_TRIANGLE;

@fragment
fn main(in: In) -> @location(0) vec4f {
	let position: vec2u = vec2u(in.position.xy);
	var color: vec3f;

	if (VISUALIZATION_MODE == VISUALIZATION_MODE_DEPTH) {
		let depth: f32 = textureLoad(depthTexture, position, 0);
		let linearDepth: f32 = linearizeDepth(depth);

		color = vec3f(linearDepth);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_INSTANCE) {
		let visibility: u32 = textureLoad(visibilityTexture, position).r;
		let instanceIndex: u32 = (visibility >> 7) - 1;

		color = intToColor(instanceIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_TRIANGLE) {
		let visibility: u32 = textureLoad(visibilityTexture, position).r;
		let triangleIndex: u32 = visibility & 0x7f;

		color = intToColor(triangleIndex) * 0.8 + 0.2;
	}

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

fn linearizeDepth(depth: f32) -> f32 {
	return (2 * NEAR) / (FAR + NEAR - depth * (FAR - NEAR));	
}