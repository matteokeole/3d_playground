@group(0) @binding(0) var depthTexture: texture_storage_2d<r32uint, read>;
@group(0) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(0) @binding(2) var debugTexture: texture_storage_2d<r32uint, read>;

struct Input {
	@builtin(position) position: vec4f,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
	debugValues: vec2u,
}

const WIRE_COLOR: vec3f = vec3f(1, .2, 0);
const VISUALIZE_MASK: u32 = 0;
const VISUALIZE_TRIANGLES: u32 = 1;
const VISUALIZE_PATCHES: u32 = 2;
const VISUALIZE_INSTANCES: u32 = 3;
const DEBUG_MODE: u32 = VISUALIZE_PATCHES;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let uv: vec2u = vec2u(input.position.xy);

	let visibilityTexel: vec2u = textureLoad(visibilityTexture, uv).xy;
	var instanceIndex: u32 = 0;
	var triangleIndex: u32 = 0;
	var depth: u32 = 0;

	unpackVisibilityTexel(visibilityTexel, &instanceIndex, &triangleIndex, &depth);

	if (depth == 0) {
		return vec4f(0, 0, 0, 1);
	}

	let debugValueMax: u32 = textureLoad(debugTexture, uv).x;

	if (DEBUG_MODE == VISUALIZE_TRIANGLES) {
		return visualizeTriangles(triangleIndex, debugValueMax);
	}

	if (DEBUG_MODE == VISUALIZE_PATCHES) {
		return visualizePatches(triangleIndex);
	}

	if (DEBUG_MODE == VISUALIZE_INSTANCES) {
		return visualizeInstances(instanceIndex);
	}

	if (DEBUG_MODE == VISUALIZE_MASK) {
		return visualizeMask(uv);
	}

	return vec4f(0, 0, 0, 1);
}

fn unpackVisibilityTexel(visibilityTexel: vec2u, instanceIndex: ptr<function, u32>, triangleIndex: ptr<function, u32>, depth: ptr<function, u32>) {
	*instanceIndex = visibilityTexel.r >> 7;
	*triangleIndex = visibilityTexel.r & 0x7f;
	*depth = visibilityTexel.g;
}

/**
 * Colored wireframe with Sobel edge detection
 */
fn applyWireframeFilter(PixelPosXY: vec2i, DepthInt: u32, WireColor: vec3f) -> vec3f {
	// Sobel edge detect depth
	let SobelX: array<i32, 9> = array(
		1,  0, -1,
		2,  0, -2,
		1,  0, -1
	);

	let SobelY: array<i32, 9> = array(
		 1,  2,  1,
		 0,  0,  0,
		-1, -2, -1
	);

	let UVSample: array<vec2i, 9> = array(
		vec2i(-1,  1),  vec2i(0,  1),  vec2i(1,  1),
		vec2i(-1,  0),  vec2i(0,  0),  vec2i(1,  0),
		vec2i(-1, -1),  vec2i(0, -1),  vec2i(1, -1)
	);

	var DepthGrad: vec2f = vec2f(0);
	var BitGrad: vec2u = vec2u(0x88888888);

	var VisibleClusterIndexCurrent: u32 = 0;
	var TriIndexCurrent: u32 = 0;
	var DepthIntCurrent: u32 = 0;

	for (var Tap: u32 = 0; Tap < 9u; Tap += 1) {
		let VisPixelCurrent: vec2u = textureLoad(visibilityTexture, PixelPosXY + UVSample[Tap]).xy;

		unpackVisibilityTexel(VisPixelCurrent, &VisibleClusterIndexCurrent, &TriIndexCurrent, &DepthIntCurrent);

		let SampleDensityDepth: f32 = log2(/*ConvertFromDeviceZ*/(f32(DepthIntCurrent)) + 1.0f) * 10.0f;

		DepthGrad += vec2f(f32(SobelX[Tap]), f32(SobelY[Tap])) * SampleDensityDepth;

		var Bits: u32 = 0;

		for (var BitIndex: u32 = 0; BitIndex < 8; BitIndex += 1) {
			Bits |= ((TriIndexCurrent >> BitIndex) & 1u) << (BitIndex * 4u);
		}

		BitGrad.x += u32(SobelX[Tap]) * Bits;
		BitGrad.y += u32(SobelY[Tap]) * Bits;
	}

	var Wireframe: f32 = 0;

	for (var BitIndex: u32 = 0; BitIndex < 8; BitIndex += 1) {
		let Grad: vec2f = vec2f(f32((BitGrad.x >> (BitIndex * 4u)) & 0xF), f32((BitGrad.y >> (BitIndex * 4u)) & 0xF));

		Wireframe = max(Wireframe, length(Grad - f32(8u)));
	}

	Wireframe *= 0.25f;

	if (Wireframe == 0.0f)
	{
		discard;
	}

	return saturate(WireColor * Wireframe);
}

fn visualizeMask(uv: vec2u) -> vec4f {
	let depth: u32 = textureLoad(depthTexture, uv).r;

	if (depth == 0) {
		return vec4f(0, 0, 0, 0);
	}

	return vec4f(0, 1, 0, .5);
}

fn visualizeTriangles(triangleIndex: u32, debugValueMax: u32) -> vec4f {
	var triIndex: u32 = triangleIndex;

	let subPatchAndMicroTri: vec2u = vec2u(unpack2x16unorm(debugValueMax));
	let subPatch: u32 = subPatchAndMicroTri.x;
	let microTri: u32 = subPatchAndMicroTri.y;

	if (microTri != 0) {
		triIndex = murmurAdd(triIndex, subPatch);
		triIndex = murmurAdd(triIndex, microTri);
	}

	let color: vec3f = intToColor(triIndex) * 0.8 + 0.2;

	return vec4f(color, 1);
}

fn visualizePatches(triangleIndex: u32) -> vec4f {
	let color: vec3f = intToColor(triangleIndex) * 0.8 + 0.2;

	return vec4f(color, 1);
}

fn visualizeInstances(instanceIndex: u32) -> vec4f {
	let color: vec3f = intToColor(instanceIndex) * 0.8 + 0.2;

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

fn murmurAdd(_hash: u32, _element: u32) -> u32 {
	var hash: u32 = _hash;
	var element: u32 = _element;

	element *= 0xcc9e2d51;
	element = (element << 15) | (element >> (32 - 15));
	element *= 0x1b873593;

	hash ^= element;
	hash = (hash << 13) | (hash >> (32 - 13));
	hash = hash * 5 + 0xe6546b64;

	return hash;
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