// Include Visualization.wgsl

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uv: vec2u = vec2u(in.position.xy);

	let visibility: u32 = textureLoad(visibilityTexture, uv).r;
	var clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

	if (clusterIndex == 0) {
		return vec4f(BACKGROUND_COLOR, 1);
	}

	clusterIndex -= 1;

	let cluster: Cluster = clusterBuffer[clusterIndex];
	let mesh: Mesh = meshBuffer[cluster.meshIndex];
	let geometry: Geometry = geometryBuffer[mesh.geometryIndex];

	let triangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
	let triangle: array<vec4f, 3> = fetchTriangle(clusterIndex, triangleIndex, geometry);

	return vec4f(1, 0.2, 0, 1);
}