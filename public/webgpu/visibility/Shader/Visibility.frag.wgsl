@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	let clusterIndex: u32 = in.clusterIndex + 1; // Add 1 to be able to visualize it (0 = empty)?
	let triangleIndex: u32 = in.triangleIndex; // Add 1 to be able to visualize it (0 = empty)? Doesn't seem to be an issue

	let visibility: u32 = (clusterIndex << 7) | triangleIndex;

	return vec2u(visibility, 0);
}