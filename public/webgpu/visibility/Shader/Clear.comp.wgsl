@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(2) var<storage, read_write> depthBuffer: array<atomic<u32>>;
@group(1) @binding(3) var<storage, read_write> visibilityBuffer: array<atomic<u32>>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct Input {
	@builtin(global_invocation_id) globalInvocationId: vec3u,
}

@compute
@workgroup_size(8, 8, 1)
fn main(input: Input) {
	let position: vec2u = input.globalInvocationId.xy;

	if (any(position >= view.viewport.zw)) {
		return;
	}

	clearTexel(position);
}

fn clearTexel(uv: vec2u) {
	let pos: u32 = position1d(uv);

	atomicStore(&depthBuffer[pos], 0);
	atomicStore(&visibilityBuffer[pos], 0);
}

fn position1d(uv: vec2u) -> u32 {
	return uv.y * view.viewport.z + uv.x;
}