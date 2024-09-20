@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	let visibility: u32 = ((in.clusterIndex + 1) << VISIBILITY_CLUSTER_MASK) | in.triangleIndex;

	return vec2u(visibility, 0);
}