@group(3) @binding(0) var depthTexture: texture_storage_2d<r32uint, read_write>;
@group(3) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;
@group(3) @binding(2) var debugTexture: texture_storage_2d<r32uint, write>;

struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
	debugValues: vec2u,
	visualizationValues: vec2u,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) {
	let uv: vec2u = vec2u(input.position.xy);

	let value: u32 = ((input.instanceIndex + 1) << 7) | input.triangleIndex;

	let sampledDepth: f32 = f32(textureLoad(depthTexture, uv).r) / far;
	let depth: f32 = input.position.w * far;

	var texel: VisibilityTexel = createVisibilityTexel(uv, value, depth);

	texel.visualizationValues = getVisualizationValues(1, 0, 0);

	if (depth > sampledDepth) {
		writeTexel(&texel);

		return;
	}
}

fn writeVisibilityTexel(uv: vec2u, visibility: u32, depth: u32) {
	textureStore(visibilityTexture, uv, vec4u(visibility, depth, 0, 1));
}

fn writeDepthTexel(uv: vec2u, depth: u32) {
	textureStore(depthTexture, uv, vec4u(depth, 0, 0, 1));
}

fn writeDebugTexel(uv: vec2u, debug: u32) {
	textureStore(debugTexture, uv, vec4u(debug, 0, 0, 1));
}

fn createVisibilityTexel(uv: vec2u, value: u32, depth: f32) -> VisibilityTexel {
	var texel: VisibilityTexel;
	texel.uv = uv;
	texel.value = value;
	texel.depth = depth;

	return texel;
}

fn writeTexel(texel: ptr<function, VisibilityTexel>) {
	texel.depth = saturate(texel.depth);

	let depthInt: u32 = u32(texel.depth);

	writeVisibilityTexel(texel.uv, texel.value, depthInt);
	writeDepthTexel(texel.uv, depthInt);
	writeDebugTexel(texel.uv, texel.visualizationValues.x);
}

fn getVisualizationValues(addValue: u32, subPatch: u32, microTri: u32) -> vec2u {
	var visualizationValueMax: u32 = 1;
	let visualizationValueAdd: u32 = addValue;

	visualizationValueMax |= pack2x16unorm(vec2f(
		f32(subPatch & 0xff),
		f32(microTri & 0xff),
	));

	return vec2u(visualizationValueMax, visualizationValueAdd);
}