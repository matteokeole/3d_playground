@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	// TODO: Triangle index must be < 128
	// TODO: Split geometry into clusters of 128 triangles each
	let visibility: u32 = ((in.instanceIndex + 1) << 7) | in.triangleIndex;

	return vec2u(visibility, 0);
}