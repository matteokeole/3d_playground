struct VertexInput {
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex: u32,
}

@vertex
fn main(in: VertexInput) -> VertexOutput {
	let index: u32 = indexBuffer[in.vertexIndex];
	let vertex: vec3f = fetchVertex(index);

	let instanceTriangleIndex: u32 = in.vertexIndex / 3;
	let triangleOffset: u32 = in.instanceIndex * geometry.triangleCount;
	let triangleIndex: u32 = triangleOffset + instanceTriangleIndex;

	let instance: Instance = instances[in.instanceIndex];

	var out: VertexOutput;
	out.position = view.viewProjection * instance.projection * vec4f(vertex, 1);
	out.instanceIndex = in.instanceIndex;
	out.triangleIndex = instanceTriangleIndex;

	return out;
}

fn fetchVertex(index: u32) -> vec3f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];

	return vec3f(x, y, z);
}