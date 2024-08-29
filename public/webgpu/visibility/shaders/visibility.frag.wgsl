@fragment
fn main(in: VertexOutput) -> @location(0) vec2u {
	let instanceIndex: u32 = in.instanceIndex + 1; // Add 1 to be able to visualize it (0 = empty)
	let triangleIndex: u32 = min(in.triangleIndex, 127); // Clamp to 0-127

	// TODO: Use clamped triangle index
	// TODO: Split geometry into clusters of 128 triangles each
	let visibility: u32 = (instanceIndex << 7) | (in.triangleIndex + 1);

	return vec2u(visibility, 0);
}