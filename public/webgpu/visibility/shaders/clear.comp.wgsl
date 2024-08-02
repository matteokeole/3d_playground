@group(3) @binding(0) var depthTexture: texture_storage_2d<r32uint, write>;
@group(3) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;
@group(4) @binding(0) var viewport: vec4u;

struct Input {
	@builtin(global_invocation_id) globalInvocationId: vec3u,
}

@compute(8, 8, 1)
fn main(input: Input) {
	let position: vec2u = input.globalInvocationId.xy;

	if (any(position.xy >= viewport.zw)) {
		return;
	}

	clearTexel(position.xy);
}

fn clearTexel(uv: vec2u) {
	textureStore(depthTexture, uv, vec4u(0, 0, 0, 0));
	textureStore(visibilityTexture, uv, vec4u(0, 0, 0, 0));
}