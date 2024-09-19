@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	let visibility: u32 = ((in.clusterIndex + 1) << 7) | in.triangleIndex;

	return vec2u(visibility, 0);
}