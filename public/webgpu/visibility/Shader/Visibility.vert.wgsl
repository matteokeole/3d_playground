@vertex
fn main(in: VertexInput) -> VertexOutput {
	let globalVertexIndex: u32 = in.clusterIndex * INDICES_PER_CLUSTER + in.localVertexIndex;

	let index: u32 = indexBuffer[globalVertexIndex];
	let cluster: Cluster = clusters[in.clusterIndex];
	let mesh: Mesh = meshes[cluster.meshIndex];

	let vertex: vec3f = fetchVertex(index, mesh);

	let triangleIndex: u32 = in.localVertexIndex / 3;

	var out: VertexOutput;
	out.position = view.viewProjection * mesh.world * vec4f(vertex, 1);
	out.clusterIndex = in.clusterIndex;
	out.triangleIndex = triangleIndex;

	return out;
}

fn fetchVertex(index: u32, mesh: Mesh) -> vec3f {
	let offset: u32 = mesh.clusterOffset * INDICES_PER_CLUSTER;

	let x: f32 = vertexBuffer[offset + index * 3 + 0];
	let y: f32 = vertexBuffer[offset + index * 3 + 1];
	let z: f32 = vertexBuffer[offset + index * 3 + 2];

	let vertex: vec3f = vec3f(x, y, z);

	return vertex;
}