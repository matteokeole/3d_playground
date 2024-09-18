const VISUALIZATION_MODE_DEPTH: u32 = 0;
const VISUALIZATION_MODE_TRIANGLE: u32 = 1;
const VISUALIZATION_MODE_CLUSTER: u32 = 2;
const VISUALIZATION_MODE_MESH: u32 = 3;
// const VISUALIZATION_MODE_GEOMETRY: u32 = 4;
const VISUALIZATION_MODE_NORMAL: u32 = 5;
const VISUALIZATION_MODE_FLAT_SHADING: u32 = 6;
const VISUALIZATION_MODE_PHONG_SHADING: u32 = 7;
const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_FLAT_SHADING;

const LIGHT_POSITION: vec3f = vec3f(0, 0, -0.01);

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uv3d: vec3f = in.position.xyz;
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

		if (clusterIndex > 0) {
			let cluster: Cluster = clusters[clusterIndex - 1];

			color = intToColor(cluster.meshIndex + 1);
		}

		color = color * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_NORMAL) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = (visibility >> 7);

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & 0x7f;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizeNormal(triangle, mesh.world);
		}
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_FLAT_SHADING) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = (visibility >> 7);

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & 0x7f;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizeFlatShading(triangle, mesh.world);
		}
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_PHONG_SHADING) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = (visibility >> 7);

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & 0x7f;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);
			let normals: array<vec3f, 3> = fetchNormals(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizePhongShading(triangle, normals, uv3d, mesh.world);
		}
	}

	return vec4f(color, 1);
}

fn visualizeNormal(triangle: array<vec4f, 3>, world: mat4x4f) -> vec3f {
	let a: vec3f = (triangle[0]).xyz;
	let b: vec3f = (triangle[1]).xyz;
	let c: vec3f = (triangle[2]).xyz;

	let normal: vec3f = normalize(cross(b - a, c - a));

	return normal * 0.5 + 0.5;
}

// The light is at the camera position
fn visualizeFlatShading(triangle: array<vec4f, 3>, world: mat4x4f) -> vec3f {
	let a: vec3f = (world * triangle[0]).xyz;
	let b: vec3f = (world * triangle[1]).xyz;
	let c: vec3f = (world * triangle[2]).xyz;

	let normal: vec3f = normalize(cross(b - a, c - a));
	let surfaceToLight: vec3f = normalize(-view.position);

	let shade: f32 = max(dot(normal, -surfaceToLight), 0);

	return vec3f(shade);
}

fn visualizePhongShading(triangle: array<vec4f, 3>, normals: array<vec3f, 3>, uv: vec3f, world: mat4x4f) -> vec3f {
	var p: vec3f = getNdcUv(uv);

	let a: vec3f = ((triangle[0]).xyz);
	let b: vec3f = ((triangle[1]).xyz);
	let c: vec3f = ((triangle[2]).xyz);

	var u: f32 = 0;
	var v: f32 = 0;
	var w: f32 = 0;

	computeBarycentricCoordinates2(p, a, b, c, &u, &v, &w);

	// let normal: vec3f = u * normals[0] + v * normals[1] + w * normals[2];

	return vec3f(u, v, w);
}