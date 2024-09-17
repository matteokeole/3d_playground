@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var depthTexture: texture_depth_2d;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(0) var<storage> vertexBuffer: array<f32>;
@group(2) @binding(1) var<storage> indexBuffer: array<u32>;
@group(2) @binding(2) var<storage> clusters: array<Cluster>;
@group(2) @binding(3) var<storage> geometries: array<Geometry>;
@group(3) @binding(0) var<storage> meshes: array<Mesh>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
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

const NEAR: f32 = 5;
const FAR: f32 = 1000;

const VISUALIZATION_MODE_DEPTH: u32 = 0;
const VISUALIZATION_MODE_TRIANGLE: u32 = 1;
const VISUALIZATION_MODE_CLUSTER: u32 = 2;
const VISUALIZATION_MODE_MESH: u32 = 3;
// const VISUALIZATION_MODE_GEOMETRY: u32 = 4;
const VISUALIZATION_MODE_BARY: u32 = 5;
const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_BARY;

const CAMERA_POSITION: vec3f = vec3f(0, 0, 0);
const LIGHT_POSITION: vec3f = vec3f(0.29, 4.94, 2.46);

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uv: vec2u = vec2u(in.position.xy);
	var color: vec3f;

	if (VISUALIZATION_MODE == VISUALIZATION_MODE_DEPTH) {
		let depth: f32 = textureLoad(depthTexture, uv, 0);
		let linearDepth: f32 = linearizeDepth(depth);

		color = vec3f(linearDepth);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_TRIANGLE) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let triangleIndex: u32 = visibility & 0x7f;

		color = intToColor(triangleIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_CLUSTER) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> 7;

		color = intToColor(clusterIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_MESH) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = (visibility >> 7);

		if (clusterIndex != 0) {
			let cluster: Cluster = clusters[clusterIndex - 1];

			let meshIndex: u32 = cluster.meshIndex + 1;

			color = intToColor(meshIndex);
		}

		color = color * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_BARY) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = (visibility >> 7);

		if (clusterIndex != 0) {
			let cluster: Cluster = clusters[clusterIndex - 1];

			let meshIndex: u32 = cluster.meshIndex + 1;
			let mesh: Mesh = meshes[meshIndex];

			let triangleIndex: u32 = visibility & 0x7f;
			let triangle: array<vec4f, 3> = fetchTriangle(triangleIndex);

			let result: vec3f = bary(triangle, uv, view.viewProjection * mesh.world);

			color = result;
		}

		color = color * 0.8 + 0.2;
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

fn fetchTriangle(triangleStartIndex: u32) -> array<vec4f, 3> {
	let i0: u32 = indexBuffer[triangleStartIndex * 3 + 0];
	let i1: u32 = indexBuffer[triangleStartIndex * 3 + 1];
	let i2: u32 = indexBuffer[triangleStartIndex * 3 + 2];

	let v0: vec4f = fetchVertex(i0);
	let v1: vec4f = fetchVertex(i1);
	let v2: vec4f = fetchVertex(i2);

	return array<vec4f, 3>(v0, v1, v2);
}

fn fetchVertex(index: u32) -> vec4f {
	let x: f32 = vertexBuffer[index * 3 + 0];
	let y: f32 = vertexBuffer[index * 3 + 1];
	let z: f32 = vertexBuffer[index * 3 + 2];

	return vec4f(x, y, z, 1);
}

/* fn pythagore(triangle: array<vec3f, 3>, uv: vec2u, worldViewProjection: mat4x4f) -> vec3f {
	let ndcUv: vec2f = getNdcUv(uv);

	let v0: vec3f = (worldViewProjection * vec4f(triangle[0], 1)).xyz;
	let v1: vec3f = (worldViewProjection * vec4f(triangle[1], 1)).xyz;
	let v2: vec3f = (worldViewProjection * vec4f(triangle[2], 1)).xyz;

	let v0Rgb: vec3f = vec3f(1, 0, 0);
	let v1Rgb: vec3f = vec3f(0, 1, 0);
	let v2Rgb: vec3f = vec3f(0, 0, 1);

	// let p: vec3f = (worldViewProjection * vec4f(ndcUv, 1, 1)).xyz;
	let p: vec3f = vec3f(ndcUv, 1);

	let v0Dist = sqrt(pow(v0.x - p.x, 2) + pow(v0.y - p.y, 2) + pow(v0.z - p.z, 2));
	let v1Dist = sqrt(pow(v1.x - p.x, 2) + pow(v1.y - p.y, 2) + pow(v1.z - p.z, 2));
	let v2Dist = sqrt(pow(v2.x - p.x, 2) + pow(v2.y - p.y, 2) + pow(v2.z - p.z, 2));

	let w0: f32 = 1 / v0Dist;
	let w1: f32 = 1 / v1Dist;
	let w2: f32 = 1 / v2Dist;

	let rgb: vec3f = (w0 * v0Rgb + w1 * v1Rgb + w2 * v2Rgb) / w0 + w1 + w2;

	return rgb;
} */

fn getNdcUv(uv: vec2u) -> vec2f {
	let width: u32 = view.viewport.z;
	let height: u32 = view.viewport.w;
	// let imageAspectRatio: f32 = f32(width) / f32(height);
	// let scale: f32 = 1;

	// let u: f32 = (2 * (f32(uv.x) + 0.5) / f32(width) - 1) * imageAspectRatio * scale;
	// let v: f32 = (1 - 2 * (f32(uv.y) + 0.5) / f32(height)) * scale;

	let ndcU: f32 = f32(uv.x) / f32(width) * 2 - 1;
	let ndcV: f32 = f32(uv.y) / f32(height) * 2 - 1;

	let ndcUv: vec2f = vec2f(ndcU, ndcV);

	return ndcUv;
}

fn bary(triangle: array<vec4f, 3>, uv: vec2u, worldViewProjection: mat4x4f) -> vec3f {
	let ndcUv: vec2f = getNdcUv(uv);
	let p: vec3f = vec3f(ndcUv, 1);

	let a: vec3f = (worldViewProjection * triangle[0]).xyz;
	let b: vec3f = (worldViewProjection * triangle[1]).xyz;
	let c: vec3f = (worldViewProjection * triangle[2]).xyz;

	let uvw: vec3f = computeBarycentricCoordinates(a, b, c, p);

	let aRgb: vec3f = vec3f(1, 0, 0);
	let bRgb: vec3f = vec3f(0, 1, 0);
	let cRgb: vec3f = vec3f(0, 0, 1);

	let u: f32 = uvw.x;
	let v: f32 = uvw.y;
	let w: f32 = uvw.z;

	let rgb: vec3f = vec3f(
		u * aRgb.r + v * bRgb.r + w * cRgb.r,
		u * aRgb.g + v * bRgb.g + w * cRgb.g,
		u * aRgb.b + v * bRgb.b + w * cRgb.b,
	);

	return rgb;

	/* let width: u32 = view.viewport.z;
	let height: u32 = view.viewport.w;
	let imageAspectRatio: f32 = f32(width) / f32(height);
	let scale: f32 = 1;
	let uvX: f32 = (2 * (f32(uv.x) + 0.5) / f32(width) - 1) * imageAspectRatio * scale;
	let uvY: f32 = (1 - 2 * (f32(uv.y) + 0.5) / f32(height)) * scale;
	let uvNdc: vec2f = vec2f(uvX, uvY);
	let viewport: vec2f = vec2f(view.viewport.zw);

	let barycentricDerivatives: BarycentricDerivatives = computeBarycentricDerivatives(triangle[0], triangle[1], triangle[2], uvNdc, viewport); */

	/* const colors: array<vec3f, 3> = array(
		vec3f(0.6, 0.4, 0.1),
		vec3f(0.1, 0.5, 0.3),
		vec3f(0.1, 0.3, 0.7),
	);

	let result: vec3f = u * colors[0] + v * colors[1] + w * colors[2];

	return result; */
}