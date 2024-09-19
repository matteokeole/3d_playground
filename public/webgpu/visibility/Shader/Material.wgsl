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

const VISIBILITY_CLUSTER_MASK: u32 = 7;
const VISIBILITY_TRIANGLE_MASK: u32 = 0x7f;
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

fn computeBarycentricCoordinates(a: vec3f, b: vec3f, c: vec3f, p: vec3f, u: ptr<function, f32>, v: ptr<function, f32>, w: ptr<function, f32>) {
	let v0: vec3f = b - a;
	let v1: vec3f = c - a;
	let v2: vec3f = p - a;

	let d00: f32 = dot(v0, v0);
	let d01: f32 = dot(v0, v1);
	let d11: f32 = dot(v1, v1);
	let d20: f32 = dot(v2, v0);
	let d21: f32 = dot(v2, v1);
	let denom: f32 = d00 * d11 - d01 * d01;

	*v = (d11 * d20 - d01 * d21) / denom;
	*w = (d00 * d21 - d01 * d20) / denom;
	*u = 1 - *v - *w;
}

// ChatGPT version. Less precise than computeBarycentricCoordinates.
fn computeBarycentricCoordinates2(V0: vec3<f32>, V1: vec3<f32>, V2: vec3<f32>, P: vec3<f32>, u: ptr<function, f32>, v: ptr<function, f32>, w: ptr<function, f32>) {
	let v0v1 = V1 - V0;
	let v0v2 = V2 - V0;
	let v0p = P - V0;

	// Cross products to compute areas
	let areaTotal = length(cross(v0v1, v0v2));
	let area1 = length(cross(v0p, v0v2));
	let area2 = length(cross(v0v1, v0p));

	// Barycentric coordinates
	*v = area1 / areaTotal;
	*w = area2 / areaTotal;
	*u = 1.0 - *v - *w;
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

fn computeBarycentricDerivativesConfetti(pt0: vec4f, pt1: vec4f, pt2: vec4f, pixelNdc: vec2f, two_over_windowsize: vec2f) -> BarycentricDerivatives {
	var ret: BarycentricDerivatives;

	let invW: vec3f = rcpvec3f(vec3f(pt0.w, pt1.w, pt2.w));

	//Project points on screen to calculate post projection positions in 2D
	let ndc0: vec2f = pt0.xy * invW.x;
	let ndc1: vec2f = pt1.xy * invW.y;
	let ndc2: vec2f = pt2.xy * invW.z;

	// Computing partial derivatives and prospective correct attribute interpolation with barycentric coordinates
	// Equation for calculation taken from Appendix A of DAIS paper:
	// https://cg.ivd.kit.edu/publications/2015/dais/DAIS.pdf

	// Calculating inverse of determinant(rcp of area of triangle).
	let invDet: f32 = rcpf32(determinant(mat2x2f(ndc2 - ndc1, ndc0 - ndc1)));

	//determining the partial derivatives
	// ddx[i] = (y[i+1] - y[i-1])/Determinant
	ret.ddx = vec3f(ndc1.y - ndc2.y, ndc2.y - ndc0.y, ndc0.y - ndc1.y) * invDet * invW;
	ret.ddy = vec3f(ndc2.x - ndc1.x, ndc0.x - ndc2.x, ndc1.x - ndc0.x) * invDet * invW;
	// sum of partial derivatives.
	var ddxSum: f32 = dot(ret.ddx, vec3f(1,1,1));
	var ddySum: f32 = dot(ret.ddy, vec3f(1,1,1));
	
	// Delta vector from pixel's screen position to vertex 0 of the triangle.
	let deltaVec: vec2f = pixelNdc - ndc0;

	// Calculating interpolated W at point.
	let interpInvW: f32 = invW.x + deltaVec.x*ddxSum + deltaVec.y*ddySum;
	let interpW: f32 = rcpf32(interpInvW);
	// The barycentric co-ordinate (lambda) is determined by perspective-correct interpolation. 
	// Equation taken from DAIS paper.
	ret.lambda.x = interpW * (invW[0] + deltaVec.x*ret.ddx.x + deltaVec.y*ret.ddy.x);
	ret.lambda.y = interpW * (0.0f    + deltaVec.x*ret.ddx.y + deltaVec.y*ret.ddy.y);
	ret.lambda.z = interpW * (0.0f    + deltaVec.x*ret.ddx.z + deltaVec.y*ret.ddy.z);

	//Scaling from NDC to pixel units
	ret.ddx *= two_over_windowsize.x;
	ret.ddy *= two_over_windowsize.y;
	ddxSum    *= two_over_windowsize.x;
	ddySum    *= two_over_windowsize.y;

	ret.ddy *= -1.0f;
	ddySum *= -1.0f;

	// This part fixes the derivatives error happening for the projected triangles.
	// Instead of calculating the derivatives constantly across the 2D triangle we use a projected version
	// of the gradients, this is more accurate and closely matches GPU raster behavior.
	// Final gradient equation: ddx = (((lambda/w) + ddx) / (w+|ddx|)) - lambda

	// Calculating interpW at partial derivatives position sum.
	let interpW_ddx: f32 = 1.0f / (interpInvW + ddxSum);
	let interpW_ddy: f32 = 1.0f / (interpInvW + ddySum);

	// Calculating perspective projected derivatives.
	ret.ddx = interpW_ddx*(ret.lambda*interpInvW + ret.ddx) - ret.lambda;
	ret.ddy = interpW_ddy*(ret.lambda*interpInvW + ret.ddy) - ret.lambda;  

	return ret;
}

fn interpolateWithBarycentricDerivatives3x3(barycentricDerivatives: BarycentricDerivatives, attributes: mat3x3f) -> vec3f {
	return vec3f(
		dot(attributes[0], barycentricDerivatives.lambda),
		dot(attributes[1], barycentricDerivatives.lambda),
		dot(attributes[2], barycentricDerivatives.lambda),
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

	let v0: vec4f = fetchVertex(i0 * 3);
	let v1: vec4f = fetchVertex(i1 * 3);
	let v2: vec4f = fetchVertex(i2 * 3);

	return array(v0, v1, v2);
}

fn fetchVertex(vertexBufferOffset: u32) -> vec4f {
	let x: f32 = vertexBuffer[vertexBufferOffset + 0];
	let y: f32 = vertexBuffer[vertexBufferOffset + 1];
	let z: f32 = vertexBuffer[vertexBufferOffset + 2];

	let vertex: vec4f = vec4f(x, y, z, 1);

	return vertex;
}

fn fetchNormals(clusterIndex: u32, clusterTriangleIndex: u32) -> array<vec3f, 3> {
	const clusterSizeIndices: u32 = INDICES_PER_CLUSTER;
	const componentsPerTriangle: u32 = 9;
	let clusterOffset: u32 = clusterIndex * clusterSizeIndices;
	let globalTriangleIndex: u32 = clusterOffset + clusterTriangleIndex * componentsPerTriangle;

	let i0: u32 = globalTriangleIndex + 0;
	let i1: u32 = globalTriangleIndex + 1;
	let i2: u32 = globalTriangleIndex + 2;

	let n0: vec3f = fetchNormal(i0 * 3);
	let n1: vec3f = fetchNormal(i1 * 3);
	let n2: vec3f = fetchNormal(i2 * 3);

	return array(n0, n1, n2);
}

fn fetchNormal(normalBufferOffset: u32) -> vec3f {
	let x: f32 = normalBuffer[normalBufferOffset + 0];
	let y: f32 = normalBuffer[normalBufferOffset + 1];
	let z: f32 = normalBuffer[normalBufferOffset + 2];

	// Must be already normalized
	let normal: vec3f = vec3f(x, y, z);

	return normal;
}

// Returns a UV vector in normalized device coordinates (NDC).
// The v component is flipped (positive towards top).
fn getNdcUv(uv: vec2f) -> vec2f {
	let width: f32 = f32(view.viewport.z);
	let height: f32 = f32(view.viewport.w);

	let u: f32 = uv.x / width * 2 - 1;
	let v: f32 = uv.y / height * 2 - 1;

	return vec2f(u, -v);
}