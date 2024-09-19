// Geometry visualization mode
const VISUALIZATION_MODE_DEPTH: u32 = 0;
const VISUALIZATION_MODE_TRIANGLE: u32 = 1;
const VISUALIZATION_MODE_CLUSTER: u32 = 2;
const VISUALIZATION_MODE_MESH: u32 = 3;
// const VISUALIZATION_MODE_GEOMETRY: u32 = 4;

// Data visualization modes
const VISUALIZATION_MODE_NORMAL: u32 = 10;
const VISUALIZATION_MODE_BARYCENTRIC_COORDINATES: u32 = 11;

// Shading visualization modes
const VISUALIZATION_MODE_FLAT_SHADING: u32 = 20;
const VISUALIZATION_MODE_PHONG_SHADING: u32 = 21;

const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_PHONG_SHADING;

const LIGHT_POSITION: vec3f = vec3f(0, 0, -0.01);

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uvf: vec2f = in.position.xy;
	let uv: vec2u = vec2u(in.position.xy);
	var color: vec3f;

	if (VISUALIZATION_MODE == VISUALIZATION_MODE_DEPTH) {
		let depth: f32 = textureLoad(depthTexture, uv, 0);
		let linearDepth: f32 = linearizeDepth(depth);

		color = vec3f(linearDepth);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_TRIANGLE) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let triangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;

		color = intToColor(triangleIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_CLUSTER) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		color = intToColor(clusterIndex) * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_MESH) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		if (clusterIndex > 0) {
			let cluster: Cluster = clusters[clusterIndex - 1];

			color = intToColor(cluster.meshIndex + 1);
		}

		color = color * 0.8 + 0.2;
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_NORMAL) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizeNormal(triangle, mesh.world);
		}
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_FLAT_SHADING) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizeFlatShading(triangle, mesh.world);
		}
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_BARYCENTRIC_COORDINATES) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);
			let normals: array<vec3f, 3> = fetchNormals(zeroBasedClusterIndex, zeroBasedTriangleIndex);
 
			color = visualizeBarycentricCoordinates(triangle, uvf, mesh.world);
		}
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_PHONG_SHADING) {
		let visibility: u32 = textureLoad(visibilityTexture, uv).r;
		let clusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

		if (clusterIndex > 0) {
			let zeroBasedClusterIndex: u32 = clusterIndex - 1;
			let cluster: Cluster = clusters[zeroBasedClusterIndex];
			let mesh: Mesh = meshes[cluster.meshIndex];

			let zeroBasedTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
			let triangle: array<vec4f, 3> = fetchTriangle(zeroBasedClusterIndex, zeroBasedTriangleIndex);
			let normals: array<vec3f, 3> = fetchNormals(zeroBasedClusterIndex, zeroBasedTriangleIndex);

			color = visualizePhongShading(triangle, normals, uvf, mesh.world);
		}
	}

	return vec4f(color, 1);
}

fn visualizeNormal(triangle: array<vec4f, 3>, world: mat4x4f) -> vec3f {
	let a: vec3f = (world * triangle[0]).xyz;
	let b: vec3f = (world * triangle[1]).xyz;
	let c: vec3f = (world * triangle[2]).xyz;

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

fn visualizeBarycentricCoordinates(triangle: array<vec4f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = getNdcUv(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivativesConfetti(a, b, c, p, 2 / vec2f(view.viewport.zw));

	return derivatives.lambda;
}

fn visualizePhongShading(triangle: array<vec4f, 3>, normals: array<vec3f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = getNdcUv(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivativesConfetti(a, b, c, p, 2 / vec2f(view.viewport.zw));

	let normal: vec3f = normalize(interpolateWithBarycentricDerivatives3x3(derivatives, mat3x3f(normals[0], normals[1], normals[2])));

	return normal;
}