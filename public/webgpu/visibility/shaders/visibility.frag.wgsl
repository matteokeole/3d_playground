@group(3) @binding(0) var depthTexture: texture_storage_2d<r32uint, read_write>;
@group(3) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;

struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
	@location(2) clipZW: vec2f,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) {
	let svPosition: vec4f = vec4f(input.position.xy, input.clipZW.x / input.clipZW.y, input.clipZW.y);
	// let svPosition: vec4f = input.position;

	let uv: vec2u = vec2u(svPosition.xy);
	let value: u32 = ((input.instanceIndex + 1) << 7) | input.triangleIndex;
	var texel: VisibilityTexel = createVisibilityTexel(uv, value, svPosition.z);

	writeVisibilityTexel(&texel);
}

fn createVisibilityTexel(uv: vec2u, value: u32, depth: f32) -> VisibilityTexel {
	var texel: VisibilityTexel;
	texel.uv = uv;
	texel.value = value;
	texel.depth = depth;

	return texel;
}

fn writeVisibilityTexel(texel: ptr<function, VisibilityTexel>) {
	texel.depth = saturate(texel.depth);

	let depth: u32 = u32(texel.depth);

	writeTexel(visibilityTexture, texel.uv, texel.value, depth);
}

fn writeTexel(texture: texture_storage_2d<rg32uint, write>, uv: vec2u, value: u32, depth: u32) {
	/* let sampledDepth: u32 = textureLoad(depthTexture, uv).r;

	if (depth < sampledDepth) {
		return;
	} */

	let packedValue: vec2u = vec2u(value, depth);

	textureStore(texture, uv, vec4u(packedValue, 0, 1));
	// textureStore(depthTexture, uv, vec4u(0, 0, 0, 1));
}