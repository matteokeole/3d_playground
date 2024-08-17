@group(0) @binding(0) var<uniform> view: View;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct In {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

@fragment
fn main(in: In) -> @location(0) vec2u {
	let visibility: u32 = ((in.instanceIndex + 1) << 7) | (in.triangleIndex + 1);

	return vec2u(visibility, 0);
}