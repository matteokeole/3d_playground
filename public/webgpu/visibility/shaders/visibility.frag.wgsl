@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	let visibility: u32 = ((in.instanceIndex + 1) << 7) | (in.triangleIndex + 1);

	return vec2u(visibility, 0);
}