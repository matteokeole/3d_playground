// @group(0) @binding(0) var depthTexture: texture_storage_2d<r32uint, read>;
// @group(0) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(0) @binding(2) var<storage, read_write> depthBuffer: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> visibilityBuffer: array<atomic<u32>>;

struct Input {
	@builtin(position) position: vec4f,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
}

const far: f32 = 1000;
const VISUALIZE_DEPTH: u32 = 0;
const VISUALIZE_MASK: u32 = 1;
const VISUALIZE_INSTANCES: u32 = 2;
const VISUALIZE_TRIANGLES: u32 = 3;
const DEBUG_MODE: u32 = VISUALIZE_DEPTH;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let uv: vec2u = vec2u(input.position.xy);
	let xy: u32 = uv.y * 1920 + uv.x;
	let visibilityTexel: vec2u = vec2u(atomicLoad(&visibilityBuffer[xy]), atomicLoad(&depthBuffer[xy]));
	var instanceIndex: u32;
	var triangleIndex: u32;
	var depth: u32;

	unpackVisibilityTexel(visibilityTexel, &instanceIndex, &triangleIndex, &depth);

	var result: vec4f;

	if (DEBUG_MODE == VISUALIZE_DEPTH) {
		result = visualizeDepth(depth);
	}
	else if (DEBUG_MODE == VISUALIZE_MASK) {
		result = visualizeMask(uv);
	}
	else if (DEBUG_MODE == VISUALIZE_INSTANCES) {
		result = visualizeInstances(instanceIndex);
	}
	else if (DEBUG_MODE == VISUALIZE_TRIANGLES) {
		result = visualizeTriangles(triangleIndex);
	}

	return result;
}

fn unpackVisibilityTexel(texel: vec2u, instanceIndex: ptr<function, u32>, triangleIndex: ptr<function, u32>, depth: ptr<function, u32>) {
	*instanceIndex = (texel.r >> 7) - 1;
	*triangleIndex = texel.r & 0x7f;
	*depth = texel.g;
}

fn visualizeDepth(depth: u32) -> vec4f {
	let depthFloat: f32 = linearizeDepth(f32(depth) / 0xffffffff);
	let color: vec3f = vec3f(depthFloat);

	return vec4f(color, 1);
}

fn visualizeMask(uv: vec2u) -> vec4f {
	let xy: u32 = uv.y * 1920 + uv.x;
	let sampledDepth: u32 = atomicLoad(&depthBuffer[xy]);

	if (sampledDepth <= 0) {
		return vec4f(0, 0, 0, 1);
	}

	return vec4f(1, 0, 0, .5);
}

fn visualizeInstances(instanceIndex: u32) -> vec4f {
	let color: vec3f = intToColor(instanceIndex) * 0.8 + 0.2;

	return vec4f(color, 1);
}

fn visualizeTriangles(triangleIndex: u32) -> vec4f {
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

fn linearizeDepth(depth: f32) -> f32 {
	let n: f32 = 1; // camera z near
	let f: f32 = 1000; // camera z far

	return (2.0 * n) / (f + n - depth * (f - n));	
}