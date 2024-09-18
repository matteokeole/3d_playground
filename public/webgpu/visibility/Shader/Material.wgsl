@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var depthTexture: texture_depth_2d;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(2) @binding(1) var<storage> indexBuffer: array<u32>;
@group(2) @binding(2) var<storage> clusters: array<Cluster>;
@group(2) @binding(3) var<storage> normalBuffer: array<f32>;
@group(3) @binding(0) var<storage> meshes: array<Mesh>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
}

struct In {
	@builtin(position) position: vec4f,
}

struct Cluster {
	meshIndex: u32,
}

struct Geometry {
	triangleCount: u32,
}

struct Mesh {
	world: mat4x4f,
}

const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = 3 * TRIANGLES_PER_CLUSTER;
const NEAR: f32 = 0.1;
const FAR: f32 = 1000;

struct BarycentricDerivatives {
	lambda: vec3f,
	ddx: vec3f,
	ddy: vec3f,
}

fn intToColor(int: u32) -> vec3f {
	var hash: u32 = murmurMix(int);
	var color: vec3f = vec3f(
		f32((hash >>  0) & 255),
		f32((hash >>  8) & 255),
		f32((hash >> 16) & 255),
	);

	return color * (1.0f / 255.0f);
}

fn murmurMix(_hash: u32) -> u32 {
	var hash: u32 = _hash;

	hash ^= hash >> 16;
	hash *= 0x85ebca6b;
	hash ^= hash >> 13;
	hash *= 0xc2b2ae35;
	hash ^= hash >> 16;

	return hash;
}

fn linearizeDepth(depth: f32) -> f32 {
	return (2 * NEAR) / (FAR + NEAR - depth * (FAR - NEAR));	
}

fn computeBarycentricDerivatives(pt0: vec4f, pt1: vec4f, pt2: vec4f, pixelNdc: vec2f, winSize: vec2f) -> BarycentricDerivatives {
	var ret: BarycentricDerivatives;

	let invW: vec3f = rcpvec3f(vec3f(pt0.w, pt1.w, pt2.w));

	let ndc0: vec2f = pt0.xy * invW.x;
	let ndc1: vec2f = pt1.xy * invW.y;
	let ndc2: vec2f = pt2.xy * invW.z;

	let invDet: f32 = rcpf32(determinant(mat2x2f(ndc2 - ndc1, ndc0 - ndc1)));
	ret.ddx = vec3f(ndc1.y - ndc2.y, ndc2.y - ndc0.y, ndc0.y - ndc1.y) * invDet * invW;
	ret.ddy = vec3f(ndc2.x - ndc1.x, ndc0.x - ndc2.x, ndc1.x - ndc0.x) * invDet * invW;
	var ddxSum: f32 = dot(ret.ddx, vec3f(1));
	var ddySum: f32 = dot(ret.ddy, vec3f(1));

	let deltaVec: vec2f = pixelNdc - ndc0;
	let interpInvW: f32 = invW.x + deltaVec.x * ddxSum + deltaVec.y * ddySum;
	let interpW: f32 = rcpf32(interpInvW);

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

fn interpolateWithBarycentricDerivatives(derivatives: BarycentricDerivatives, v: vec3f) -> vec3f {
	return vec3f(
		dot(v, derivatives.lambda),
		dot(v, derivatives.ddx),
		dot(v, derivatives.ddy),
	);
}

fn rcpf32(a: f32) -> f32 {
	return 1 / a;
}

fn rcpvec3f(a: vec3f) -> vec3f {
	return vec3f(
		1 / a.x,
		1 / a.y,
		1 / a.z,
	);
}

fn fetchTriangle(clusterIndex: u32, clusterTriangleIndex: u32) -> array<vec4f, 3> {
	let offset: u32 = clusterIndex * INDICES_PER_CLUSTER + clusterTriangleIndex * 3;
	let i0: u32 = indexBuffer[offset + 0];
	let i1: u32 = indexBuffer[offset + 1];
	let i2: u32 = indexBuffer[offset + 2];

	let v0: vec4f = fetchVertex(i0);
	let v1: vec4f = fetchVertex(i1);
	let v2: vec4f = fetchVertex(i2);

	return array(v0, v1, v2);
}

fn fetchVertex(index: u32) -> vec4f {
	let x: f32 = vertexBuffer[index * 3 + 0];
	let y: f32 = vertexBuffer[index * 3 + 1];
	let z: f32 = vertexBuffer[index * 3 + 2];

	return vec4f(x, y, z, 1);
}

fn fetchNormals(clusterIndex: u32, clusterTriangleIndex: u32) -> array<vec3f, 3> {
	let offset: u32 = clusterIndex * INDICES_PER_CLUSTER + clusterTriangleIndex * 3;
	let i0: u32 = indexBuffer[offset + 0];
	let i1: u32 = indexBuffer[offset + 1];
	let i2: u32 = indexBuffer[offset + 2];

	let n0: vec3f = fetchNormal(i0);
	let n1: vec3f = fetchNormal(i1);
	let n2: vec3f = fetchNormal(i2);

	return array(n0, n1, n2);
}

fn fetchNormal(normalBufferOffset: u32) -> vec3f {
	let nx: f32 = normalBuffer[normalBufferOffset * 3 + 0];
	let ny: f32 = normalBuffer[normalBufferOffset * 3 + 1];
	let nz: f32 = normalBuffer[normalBufferOffset * 3 + 2];

	return vec3f(nx, ny, nz);
}

fn getNdcUv(uv: vec3f) -> vec3f {
	let width: f32 = f32(view.viewport.z);
	let height: f32 = f32(view.viewport.w);

	let u: f32 = uv.x / width * 2 - 1;
	let v: f32 = uv.y / height * 2 - 1;

	return vec3f(u, v, uv.z);
}