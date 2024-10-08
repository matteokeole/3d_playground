@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var depthTexture: texture_depth_2d;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(0) var<storage> vertexPositionBuffer: array<f32>;
@group(2) @binding(1) var<storage> vertexNormalBuffer: array<f32>;
@group(2) @binding(2) var<storage> indexBuffer: array<Vertex>;
@group(2) @binding(3) var<storage> clusterBuffer: array<Cluster>;
@group(3) @binding(0) var<storage> meshBuffer: array<Mesh>;
@group(3) @binding(1) var<storage> geometryBuffer: array<Geometry>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
}

struct Vertex {
	positionIndex: u32,
	normalIndex: u32,
}

struct Cluster {
	meshIndex: u32,
	materialIndex: u32,
}

struct Mesh {
	world: mat4x4f,
	geometryIndex: u32,
}

struct Geometry {
	vertexBufferOffset: u32, // Offset in indices where the geometry starts in the vertex position buffer
	normalBufferOffset: u32, // Offset in indices where the geometry starts in the vertex normal buffer
	normalCount: u32,
}

struct Material {
	ambient: vec3f,
	diffuse: vec3f,
	specular: vec3f,
	shininess: f32,
}

struct Light {
	position: vec3f,
	ambient: vec3f,
	diffuse: vec3f,
	specular: vec3f,
}

struct Primitive {
	vertex0: Vertex,
	vertex0Position: vec4f,
	vertex0Normal: vec3f,
	vertex1: Vertex,
	vertex1Position: vec4f,
	vertex1Normal: vec3f,
	vertex2: Vertex,
	vertex2Position: vec4f,
	vertex2Normal: vec3f,
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
const VERTICES_PER_PRIMITIVE: u32 = 3;
const TRIANGLES_PER_CLUSTER: u32 = 128;
const INDICES_PER_CLUSTER: u32 = VERTICES_PER_PRIMITIVE * TRIANGLES_PER_CLUSTER;

const VERTEX_POSITION_STRIDE: u32 = 3;
const VERTEX_NORMAL_STRIDE: u32 = 3;

const NEAR: f32 = 0.1;
const FAR: f32 = 512; // HL1 scene

///
/// Translates an int to a normalized RGB color.
/// Note: 0 is not visible with this hash.
///
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

fn interpolate3x1(derivatives: BarycentricDerivatives, a: f32, b: f32, c: f32) -> f32 {
	return derivatives.lambda.x * a + derivatives.lambda.y * b + derivatives.lambda.z * c;
}

fn interpolate3x3(derivatives: BarycentricDerivatives, a: vec3f, b: vec3f, c: vec3f) -> vec3f {
	return derivatives.lambda.x * a + derivatives.lambda.y * b + derivatives.lambda.z * c;
}

// TODO: Fix normal fetching with multiple geometries
fn fetchPrimitive(clusterIndex: u32, clusterTriangleIndex: u32, geometry: Geometry) -> Primitive {
	let vertexOffset: u32 = clusterIndex * INDICES_PER_CLUSTER + clusterTriangleIndex * VERTICES_PER_PRIMITIVE;
	var primitive: Primitive;

	primitive.vertex0 = indexBuffer[vertexOffset + 0];
	primitive.vertex1 = indexBuffer[vertexOffset + 1];
	primitive.vertex2 = indexBuffer[vertexOffset + 2];

	primitive.vertex0Position = fetchVertex(geometry.vertexBufferOffset + primitive.vertex0.positionIndex);
	primitive.vertex1Position = fetchVertex(geometry.vertexBufferOffset + primitive.vertex1.positionIndex);
	primitive.vertex2Position = fetchVertex(geometry.vertexBufferOffset + primitive.vertex2.positionIndex);

	primitive.vertex0Normal = fetchNormal(geometry.normalBufferOffset + primitive.vertex0.normalIndex);
	primitive.vertex1Normal = fetchNormal(geometry.normalBufferOffset + primitive.vertex1.normalIndex);
	primitive.vertex2Normal = fetchNormal(geometry.normalBufferOffset + primitive.vertex2.normalIndex);

	return primitive;
}

fn fetchVertex(index: u32) -> vec4f {
	let offset: u32 = index * VERTEX_POSITION_STRIDE;

	let x: f32 = vertexPositionBuffer[offset + 0];
	let y: f32 = vertexPositionBuffer[offset + 1];
	let z: f32 = vertexPositionBuffer[offset + 2];

	let vertex: vec4f = vec4f(x, y, z, 1);

	return vertex;
}

fn fetchNormal(index: u32) -> vec3f {
	let offset: u32 = index * VERTEX_NORMAL_STRIDE;

	let x: f32 = vertexNormalBuffer[offset + 0];
	let y: f32 = vertexNormalBuffer[offset + 1];
	let z: f32 = vertexNormalBuffer[offset + 2];

	let normal: vec3f = vec3f(x, y, z);

	return normal;
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

fn adjustVisualizationColor(color: vec3f) -> vec3f {
	return color;
	// return color * 0.75 + 0.25;
}