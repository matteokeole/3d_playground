@group(0) @binding(0) var depthTexture: texture_storage_2d<r32uint, write>;
@group(0) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;

struct Input {
	@builtin(global_invocation_id) globalInvocationId: vec3u,
}

const viewport: vec4u = vec4u(0, 0, 1920, 1080);

@compute
@workgroup_size(8, 8, 1)
fn main(input: Input) {
	let position: vec2u = input.globalInvocationId.xy;

	if (any(position >= viewport.zw)) {
		return;
	}

	clearTexel(position);
}

fn clearTexel(uv: vec2u) {
	// textureStore(depthTexture, uv, vec4u(0, 0, 0, 0));
	textureStore(visibilityTexture, uv, vec4u(0, 0, 0, 0));
}