@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(2) @binding(1) var<storage> indexBuffer: array<u32>;
@group(2) @binding(2) var<storage> clusters: array<Cluster>;
@group(3) @binding(0) var<storage> meshes: array<Mesh>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
}

struct Cluster {
	meshIndex: u32,
}

struct Mesh {
	world: mat4x4f,
}

struct BarycentricDerivatives {
	lambda: vec3f,
	ddx: vec3f,
	ddy: vec3f,
}

struct In {
	@builtin(position) position: vec4f,
}

const VISIBILITY_CLUSTER_MASK: u32 = 7;
const VISIBILITY_TRIANGLE_MASK: u32 = 0x7f;
const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = 3 * TRIANGLES_PER_CLUSTER;

fn computeBarycentricDerivatives(pt0: vec4f, pt1: vec4f, pt2: vec4f, pixelNdc: vec2f, winSize: vec2f) -> BarycentricDerivatives {
	var ret: BarycentricDerivatives;

	let invW: vec3f = 1 / vec3f(pt0.w, pt1.w, pt2.w);

	let ndc0: vec2f = pt0.xy * invW.x;
	let ndc1: vec2f = pt1.xy * invW.y;
	let ndc2: vec2f = pt2.xy * invW.z;

	let invDet: f32 = 1 / determinant(mat2x2f(ndc2 - ndc1, ndc0 - ndc1));
	ret.ddx = vec3f(ndc1.y - ndc2.y, ndc2.y - ndc0.y, ndc0.y - ndc1.y) * invDet * invW;
	ret.ddy = vec3f(ndc2.x - ndc1.x, ndc0.x - ndc2.x, ndc1.x - ndc0.x) * invDet * invW;
	var ddxSum: f32 = dot(ret.ddx, vec3f(1));
	var ddySum: f32 = dot(ret.ddy, vec3f(1));

	let deltaVec: vec2f = pixelNdc - ndc0;
	let interpInvW: f32 = invW.x + deltaVec.x * ddxSum + deltaVec.y * ddySum;
	let interpW: f32 = 1 / interpInvW;

	ret.lambda.x = interpW * (invW[0] + deltaVec.x * ret.ddx.x + deltaVec.y * ret.ddy.x);
	ret.lambda.y = interpW * (0.0f    + deltaVec.x * ret.ddx.y + deltaVec.y * ret.ddy.y);
	ret.lambda.z = interpW * (0.0f    + deltaVec.x * ret.ddx.z + deltaVec.y * ret.ddy.z);

	ret.ddx *= (2.0f/winSize.x);
	ret.ddy *= (2.0f/winSize.y);
	ddxSum  *= (2.0f/winSize.x);
	ddySum  *= (2.0f/winSize.y);

	ret.ddy *= -1.0f;
	ddySum  *= -1.0f;

	let interpW_ddx: f32 = 1.0f / (interpInvW + ddxSum);
	let interpW_ddy: f32 = 1.0f / (interpInvW + ddySum);

	ret.ddx = interpW_ddx * (ret.lambda * interpInvW + ret.ddx) - ret.lambda;
	ret.ddy = interpW_ddy * (ret.lambda * interpInvW + ret.ddy) - ret.lambda;  

	return ret;
}

fn fetchTriangle(clusterIndex: u32, clusterTriangleIndex: u32) -> array<vec4f, 3> {
	let offset: u32 = clusterIndex * INDICES_PER_CLUSTER + clusterTriangleIndex * 3;

	let index0: u32 = indexBuffer[offset + 0];
	let index1: u32 = indexBuffer[offset + 1];
	let index2: u32 = indexBuffer[offset + 2];

	let vertex0: vec4f = fetchVertex(index0 * 3);
	let vertex1: vec4f = fetchVertex(index1 * 3);
	let vertex2: vec4f = fetchVertex(index2 * 3);

	return array(vertex0, vertex1, vertex2);
}

fn fetchVertex(vertexBufferOffset: u32) -> vec4f {
	let x: f32 = vertexBuffer[vertexBufferOffset + 0];
	let y: f32 = vertexBuffer[vertexBufferOffset + 1];
	let z: f32 = vertexBuffer[vertexBufferOffset + 2];

	let vertex: vec4f = vec4f(x, y, z, 1);

	return vertex;
}

// Returns a UV vector in normalized device coordinates (NDC).
// The v component is flipped (positive towards top).
fn ndc(uv: vec2f) -> vec2f {
	let width: f32 = f32(view.viewport.z);
	let height: f32 = f32(view.viewport.w);

	let u: f32 = uv.x / width * 2 - 1;
	let v: f32 = uv.y / height * 2 - 1;

	return vec2f(u, -v);
}