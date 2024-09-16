struct VertexInput {
	@builtin(instance_index) clusterIndex: u32,
	@builtin(vertex_index) localVertexIndex: u32,
}

const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = 3 * TRIANGLES_PER_CLUSTER;

@vertex
fn main(in: VertexInput) -> VertexOutput {
	let globalVertexIndex: u32 = in.clusterIndex * INDICES_PER_CLUSTER + in.localVertexIndex;

	let index: u32 = indexBuffer[globalVertexIndex];
	let vertex: vec3f = fetchVertex(index);

	let triangleIndex: u32 = in.localVertexIndex / 3;

	let cluster: Cluster = clusters[in.clusterIndex];

	let mesh: Mesh = meshes[cluster.meshIndex];

	var out: VertexOutput;
	out.position = view.viewProjection * mesh.world * vec4f(vertex, 1);
	out.clusterIndex = in.clusterIndex;
	out.triangleIndex = triangleIndex;

	return out;
}

fn fetchVertex(index: u32) -> vec3f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];

	return vec3f(x, y, z);
}