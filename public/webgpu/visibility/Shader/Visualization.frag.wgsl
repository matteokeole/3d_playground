// Geometry visualization modes
const VISUALIZATION_MODE_TRIANGLE: u32 = 0;
const VISUALIZATION_MODE_CLUSTER: u32 = 1;
const VISUALIZATION_MODE_MESH: u32 = 2;
const VISUALIZATION_MODE_GEOMETRY: u32 = 3;

// Data visualization modes
const VISUALIZATION_MODE_DEPTH: u32 = 10;
const VISUALIZATION_MODE_FACE_NORMAL: u32 = 11;
const VISUALIZATION_MODE_BARYCENTRIC_COORDINATES: u32 = 12;
const VISUALIZATION_MODE_VERTEX_NORMAL: u32 = 13;

// Shading visualization modes
const VISUALIZATION_MODE_FLAT_SHADING: u32 = 20;
const VISUALIZATION_MODE_PHONG_SHADING: u32 = 21;

const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_PHONG_SHADING;

@fragment
fn main(in: In) -> @location(0) vec4f {
	let uvf: vec2f = in.position.xy;
	let uv: vec2u = vec2u(uvf);
	let visibility: u32 = textureLoad(visibilityTexture, uv).r;
	let testClusterIndex: u32 = visibility >> VISIBILITY_CLUSTER_MASK;

	if (VISUALIZATION_MODE != VISUALIZATION_MODE_DEPTH && testClusterIndex == 0) {
		return vec4f(0, 0, 0, 1);
	}

	// Fetch cluster
	let clusterIndex: u32 = testClusterIndex - 1;
	let cluster: Cluster = clusterBuffer[clusterIndex];

	// Fetch mesh
	let mesh: Mesh = meshBuffer[cluster.meshIndex];

	// Fetch geometry
	let geometry: Geometry = geometryBuffer[mesh.geometryIndex];

	// Fetch triangle vertices
	let clusterTriangleIndex: u32 = visibility & VISIBILITY_TRIANGLE_MASK;
	let triangleIndex: u32 = clusterIndex * TRIANGLES_PER_CLUSTER + clusterTriangleIndex;
	let triangle: array<vec4f, 3> = fetchTriangle(clusterIndex, clusterTriangleIndex, geometry);

	// Fetch triangle normals
	let normals: array<vec3f, 3> = fetchNormals(clusterIndex, clusterTriangleIndex, geometry);

	var color: vec3f;

	if (VISUALIZATION_MODE == VISUALIZATION_MODE_TRIANGLE) {
		color = intToColor(triangleIndex);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_CLUSTER) {
		color = intToColor(clusterIndex);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_MESH) {
		color = intToColor(cluster.meshIndex);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_GEOMETRY) {
		color = intToColor(mesh.geometryIndex);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_DEPTH) {
		let depth: f32 = textureLoad(depthTexture, uv, 0);
		let linearDepth: f32 = linearizeDepth(depth);

		color = vec3f(linearDepth);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_FACE_NORMAL) {
		color = visualizeFaceNormal(triangle, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_VERTEX_NORMAL) {
		color = visualizeVertexNormal(triangle, normals, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_BARYCENTRIC_COORDINATES) {
		color = visualizeBarycentricCoordinates(triangle, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_FLAT_SHADING) {
		color = visualizeFlatShading(triangle, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_PHONG_SHADING) {
		color = visualizePhongShading(triangle, normals, uvf, mesh.world);
	}

	color = adjustVisualizationColor(color);

	return vec4f(color, 1);
}

fn visualizeFaceNormal(triangle: array<vec4f, 3>, world: mat4x4f) -> vec3f {
	let a: vec3f = triangle[0].xyz;
	let b: vec3f = triangle[1].xyz;
	let c: vec3f = triangle[2].xyz;

	let normal: vec3f = normalize(cross(b - a, c - a));

	return normal * 0.5 + 0.5;
}

fn visualizeVertexNormal(triangle: array<vec4f, 3>, normals: array<vec3f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	let normal: vec3f = normalize(interpolate3x3(derivatives, normals[0], normals[1], normals[2]));

	return normal * 0.5 + 0.5;
}

fn visualizeBarycentricCoordinates(triangle: array<vec4f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	return derivatives.lambda;
}

fn visualizeFlatShading(triangle: array<vec4f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec3f = triangle[0].xyz;
	let b: vec3f = triangle[1].xyz;
	let c: vec3f = triangle[2].xyz;
	let surface: vec3f = vec3f(ndc(uv), (a.z + b.z + c.z) / 3);

	let normal: vec3f = normalize(cross(b - a, c - a));
	const lightPosition: vec3f = vec3f(1, 1, 1);
	let surfaceToLight: vec3f = normalize(lightPosition);

	let shade: f32 = max(dot(surfaceToLight, normal), 0);
	const color: vec3f = vec3f(0.5, 0.7, 0.3);

	return color * shade;
}

// TODO: Fix inverted surfaceToLight?
// The light is at the camera position
fn visualizePhongShading(triangle: array<vec4f, 3>, normals: array<vec3f, 3>, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * triangle[0];
	let b: vec4f = view.viewProjection * world * triangle[1];
	let c: vec4f = view.viewProjection * world * triangle[2];
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	let normal: vec3f = normalize(derivatives.lambda.x * normals[0] + derivatives.lambda.y * normals[1] + derivatives.lambda.z * normals[2]);
	let surface: vec3f = vec3f(p, interpolate3x1(derivatives, a.z, b.z, c.z));
	let surfaceToLight: vec3f = normalize(surface - view.position);

	let shade: f32 = max(dot(normal, surfaceToLight), 0);

	return vec3f(shade);
}