const WIREFRAME_COLOR: vec3f = vec3f(0);
const WIREFRAME_THICKNESS: f32 = 0.5;

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uv: vec2f = in.position.xy;
	let visibility: u32 = textureLoad(visibilityTexture, vec2u(uv)).r;

	let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;
	let zeroBasedClusterIndex: u32 = clusterIndex - 1;
	let zeroBasedTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;

	let cluster: Cluster = clusters[zeroBasedClusterIndex];
	let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);
	let mesh: Mesh = meshes[cluster.meshIndex];

	let color: vec3f = visualizeWireframe(triangle, mesh.world, uv);

	return vec4f(color, 1);
}

fn visualizeWireframe(triangle: array<vec4f, 3>, world: mat4x4f, uv: vec2f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	let min: f32 = min(derivatives.lambda.x, min(derivatives.lambda.y, derivatives.lambda.z));
	let delta: f32 = fwidth(min);
	let color: f32 = smoothstep(0, delta, min);

	return vec3f(color);
}