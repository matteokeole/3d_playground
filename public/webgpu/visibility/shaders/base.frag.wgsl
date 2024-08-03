@group(0) @binding(0) var depthTexture: texture_storage_2d<r32uint, read>;
@group(0) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;

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
const DEBUG_MODE: u32 = VISUALIZE_TRIANGLES;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let uv: vec2u = vec2u(input.position.xy);
	let visibilityTexel: vec2u = textureLoad(visibilityTexture, uv).rg;
	var instanceIndex: u32;
	var triangleIndex: u32;
	var depth: u32;

	unpackVisibilityTexel(visibilityTexel, &instanceIndex, &triangleIndex, &depth);

	var result: vec4f;

	if (DEBUG_MODE == VISUALIZE_DEPTH) {
		result = visualizeDepth(uv);
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

fn visualizeDepth(uv: vec2u) -> vec4f {
	let depthInt: u32 = textureLoad(visibilityTexture, uv).g;
	let depth: f32 = f32(depthInt) / far;
	let color: vec3f = vec3f(depth);

	return vec4f(color, 1);
}

fn visualizeMask(uv: vec2u) -> vec4f {
	let sampledDepth: u32 = textureLoad(depthTexture, uv).r;

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