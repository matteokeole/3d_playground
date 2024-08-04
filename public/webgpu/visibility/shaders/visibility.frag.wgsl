@group(0) @binding(0) var<uniform> view: View;
@group(2) @binding(2) var<storage, read_write> depthBuffer: array<atomic<u32>>;
@group(2) @binding(3) var<storage, read_write> visibilityBuffer: array<atomic<u32>>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct VisibilityTexel {
	uv: vec2u,
	value: u32,
	depth: f32,
}

struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) {
	let position: vec4f = vec4f(input.position.xy, input.position.z, input.position.w);

	let uv: vec2u = vec2u(position.xy);
	let value: u32 = ((input.instanceIndex + 1) << 7) | input.triangleIndex;
	let depth: f32 = position.z;
	var texel: VisibilityTexel = createVisibilityTexel(uv, value, depth);

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
	let position: u32 = position1d(texel.uv);
	let depth: u32 = u32(saturate(texel.depth) * 0xffffffff);

	writeTexel(position, texel.value, depth);
}

fn writeTexel(position: u32, value: u32, depth: u32) {
	atomicMax(&depthBuffer[position], depth);
	atomicMax(&visibilityBuffer[position], value);
}

fn position1d(uv: vec2u) -> u32 {
	return uv.y * view.viewport.z + uv.x;
}