const VERTEX_STRIDE: u32 = 2;

@vertex
fn main(in: VertexInput) -> VertexOutput {
	let globalVertexIndex: u32 = in.clusterIndex * INDICES_PER_CLUSTER + in.localVertexIndex;

	let vertex: Vertex = indexBuffer[globalVertexIndex];
	let cluster: Cluster = clusterBuffer[in.clusterIndex];
	let mesh: Mesh = meshBuffer[cluster.meshIndex];
	let geometry: Geometry = geometryBuffer[mesh.geometryIndex];

	let vertexPosition: vec3f = fetchVertex(vertex.positionIndex, geometry);

	let triangleIndex: u32 = in.localVertexIndex / 3;

	var out: VertexOutput;
	out.position = view.viewProjection * mesh.world * vec4f(vertexPosition, 1);
	out.clusterIndex = in.clusterIndex;
	out.triangleIndex = triangleIndex;

	return out;
}

fn fetchVertex(index: u32, geometry: Geometry) -> vec3f {
	let offset: u32 = (geometry.vertexBufferOffset + index) * 3;

	let x: f32 = vertexPositionBuffer[offset + 0];
	let y: f32 = vertexPositionBuffer[offset + 1];
	let z: f32 = vertexPositionBuffer[offset + 2];

	let vertex: vec3f = vec3f(x, y, z);

	return vertex;
}