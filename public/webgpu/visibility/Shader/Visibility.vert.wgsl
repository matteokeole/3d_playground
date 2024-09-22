@vertex
fn main(in: VertexInput) -> VertexOutput {
	let globalVertexIndex: u32 = in.clusterIndex * INDICES_PER_CLUSTER + in.localVertexIndex;

	let index: u32 = indexBuffer[globalVertexIndex];
	let cluster: Cluster = clusterBuffer[in.clusterIndex];
	let mesh: Mesh = meshBuffer[cluster.meshIndex];
	let geometry: Geometry = geometryBuffer[mesh.geometryIndex];

	let vertex: vec3f = fetchVertex(index, geometry);

	let triangleIndex: u32 = in.localVertexIndex / 3;

	var out: VertexOutput;
	out.position = view.viewProjection * mesh.world * vec4f(vertex, 1);
	out.clusterIndex = in.clusterIndex;
	out.triangleIndex = triangleIndex;

	return out;
}

fn fetchVertex(index: u32, geometry: Geometry) -> vec3f {
	let offset: u32 = (geometry.vertexBufferOffset + index) * 3;

	let x: f32 = vertexBuffer[offset + 0];
	let y: f32 = vertexBuffer[offset + 1];
	let z: f32 = vertexBuffer[offset + 2];

	let vertex: vec3f = vec3f(x, y, z);

	return vertex;
}