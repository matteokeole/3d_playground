// @group(3) @binding(0) var depthTexture: texture_storage_2d<r32uint, read_write>;
// @group(3) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;
@group(3) @binding(2) var<storage, read_write> depthBuffer: array<atomic<u32>>;
@group(3) @binding(3) var<storage, read_write> visibilityBuffer: array<atomic<u32>>;

struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
}

const far: f32 = 1000;

struct Test {
	items: array<atomic<i32>>,
}

@fragment
fn main(input: Input) {
	// let svPosition: vec4f = vec4f(input.position.xy, input.clipZW.x / input.clipZW.y, input.clipZW.y);
	let svPosition: vec4f = input.position;

	let uv: vec2u = vec2u(svPosition.xy);
	let value: u32 = ((input.instanceIndex + 1) << 7) | input.triangleIndex;
	let depth: f32 = input.position.z;
	var texel: VisibilityTexel = createVisibilityTexel(uv, value, depth);

	if (!earlyDepthTest(texel)) {
		return;
	}

	writeVisibilityTexel(&texel);
}

fn createVisibilityTexel(uv: vec2u, value: u32, depth: f32) -> VisibilityTexel {
	var texel: VisibilityTexel;
	texel.uv = uv;
	texel.value = value;
	texel.depth = depth;

	return texel;
}

fn earlyDepthTest(texel: VisibilityTexel) -> bool {
	let depth: u32 = u32(saturate(texel.depth) * 0xffffffff);
	let xy: u32 = texel.uv.y * 1920 + texel.uv.x;
	let currentDepth: u32 = atomicLoad(&depthBuffer[xy]);

	return currentDepth < depth;
}

fn writeVisibilityTexel(texel: ptr<function, VisibilityTexel>) {
	let depth: u32 = u32(saturate(texel.depth) * 0xffffffff);

	writeTexel(texel.uv, texel.value, depth);
}

fn writeTexel(uv: vec2u, value: u32, depth: u32) {
	/* let currentDepth: u32 = textureLoad(depthTexture, uv).r;

	if (depth <= currentDepth) {
		return;
	}

	let packedValue: vec2u = vec2u(value, depth); */

	let xy: u32 = uv.y * 1920 + uv.x;

	atomicMax(&depthBuffer[xy], depth);
	atomicMax(&visibilityBuffer[xy], value);

	// textureStore(visibilityTexture, uv, vec4u(packedValue, 0, 1));
	// textureStore(depthTexture, uv, vec4u(depth, 0, 0, 1));
}