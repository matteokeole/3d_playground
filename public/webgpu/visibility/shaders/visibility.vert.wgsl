struct VertexInput {
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex: u32,
}

@vertex
fn main(in: VertexInput) -> VertexOutput {
	let index: u32 = indexBuffer[in.vertexIndex];
	let vertex: vec3f = fetchVertex(index);

	let clusterIndex: u32 = in.vertexIndex / (128 * 3);
	let cluster: Cluster = clusters[clusterIndex];

	let triangleIndexWithinCluster: u32 = in.vertexIndex % 128;

	let meshIndex: u32 = cluster.meshIndex;
	let mesh: Mesh = meshes[meshIndex];

	var out: VertexOutput;
	out.position = view.viewProjection * mesh.projection * vec4f(vertex, 1);
	out.clusterIndex = clusterIndex;
	out.triangleIndex = triangleIndexWithinCluster;

	return out;
}

fn fetchVertex(index: u32) -> vec3f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];

	return vec3f(x, y, z);
}