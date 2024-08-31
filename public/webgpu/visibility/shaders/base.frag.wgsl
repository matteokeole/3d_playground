@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var depthTexture: texture_depth_2d;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(2) @binding(1) var<storage> indexBuffer: array<u32>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
}

struct In {
	@builtin(position) position: vec4f,
}

const NEAR: f32 = 5;
const FAR: f32 = 1000;

const VISUALIZATION_MODE_DEPTH: u32 = 0;
const VISUALIZATION_MODE_INSTANCE: u32 = 1;
const VISUALIZATION_MODE_TRIANGLE: u32 = 2;
const VISUALIZATION_MODE_PHONG: u32 = 3;
const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_TRIANGLE;

const CAMERA_POSITION: vec3f = vec3f(0, 0, 0);
const LIGHT_POSITION: vec3f = vec3f(0.29, 4.94, 2.46);

@fragment
fn main(in: In) -> @location(0) vec4f {
	let position: vec2u = vec2u(in.position.xy);
	var color: vec3f;

	if (VISUALIZATION_MODE == VISUALIZATION_MODE_DEPTH) {
		let depth: f32 = textureLoad(depthTexture, position, 0);
		let linearDepth: f32 = linearizeDepth(depth);

		color = vec3f(linearDepth);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_INSTANCE) {
		let visibility: u32 = textureLoad(visibilityTexture, position).r;
		let instanceIndex: u32 = visibility >> 7;

		color = intToColor(instanceIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_TRIANGLE) {
		let visibility: u32 = textureLoad(visibilityTexture, position).r;
		let triangleIndex: u32 = visibility & 0x7f;

		color = intToColor(triangleIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_PHONG) {
		let visibility: u32 = textureLoad(visibilityTexture, position).r;
		let triangleIndex: u32 = visibility & 0x7f;
		let triangle: array<vec3f, 3> = fetchTriangle(triangleIndex - 1);
		let result: vec3f = phong(triangle);

		color = result;
	}

	return vec4f(color, 1);
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

fn fetchTriangle(triangleStartIndex: u32) -> array<vec3f, 3> {
	let i0: u32 = indexBuffer[triangleStartIndex * 3 + 0];
	let i1: u32 = indexBuffer[triangleStartIndex * 3 + 1];
	let i2: u32 = indexBuffer[triangleStartIndex * 3 + 2];

	let v0: vec3f = fetchVertex(i0);
	let v1: vec3f = fetchVertex(i1);
	let v2: vec3f = fetchVertex(i2);

	return array<vec3f, 3>(v0, v1, v2);
}

fn fetchVertex(index: u32) -> vec3f {
	let x: f32 = vertexBuffer[index * 3 + 0];
	let y: f32 = vertexBuffer[index * 3 + 1];
	let z: f32 = vertexBuffer[index * 3 + 2];

	return vec3f(x, y, z);
}

fn phong(triangle: array<vec3f, 3>) -> vec3f {
	let a: vec3f = triangle[0];
	let b: vec3f = triangle[1];
	let c: vec3f = triangle[2];

	let ab: vec3f = b - a;
	let ac: vec3f = c - a;

	let N: vec3f = abs(normalize(cross(ab, ac)));

	// let L: vec3f = normalize(LIGHT_POSITION - CAMERA_POSITION);

	// let dot: f32 = max(dot(N, L), 0);

	return N;
}