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
const VISUALIZATION_MODE_BLINN_PHONG_SHADING: u32 = 21;

const VISUALIZATION_MODE: u32 = VISUALIZATION_MODE_BLINN_PHONG_SHADING;

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

	// Fetch primitive
	let primitive: Primitive = fetchPrimitive(clusterIndex, clusterTriangleIndex, geometry);

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
		color = visualizeFaceNormal(primitive, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_VERTEX_NORMAL) {
		color = visualizeVertexNormal(primitive, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_BARYCENTRIC_COORDINATES) {
		color = visualizeBarycentricCoordinates(primitive, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_FLAT_SHADING) {
		color = visualizeFlatShading(primitive, uvf, mesh.world);
	}
	else if (VISUALIZATION_MODE == VISUALIZATION_MODE_BLINN_PHONG_SHADING) {
		color = visualizeBlinnPhongShading(primitive, uvf, mesh.world);
	}

	color = adjustVisualizationColor(color);

	return vec4f(color, 1);
}

fn visualizeFaceNormal(primitive: Primitive, world: mat4x4f) -> vec3f {
	let a: vec3f = primitive.vertex0Position.xyz;
	let b: vec3f = primitive.vertex1Position.xyz;
	let c: vec3f = primitive.vertex2Position.xyz;

	let normal: vec3f = normalize(cross(b - a, c - a));

	return normal * 0.5 + 0.5;
}

fn visualizeVertexNormal(primitive: Primitive, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * primitive.vertex0Position;
	let b: vec4f = view.viewProjection * world * primitive.vertex1Position;
	let c: vec4f = view.viewProjection * world * primitive.vertex2Position;
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	let normal: vec3f = normalize(interpolate3x3(derivatives, primitive.vertex0Normal, primitive.vertex1Normal, primitive.vertex2Normal));

	return normal * 0.5 + 0.5;
}

fn visualizeBarycentricCoordinates(primitive: Primitive, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * primitive.vertex0Position;
	let b: vec4f = view.viewProjection * world * primitive.vertex1Position;
	let c: vec4f = view.viewProjection * world * primitive.vertex2Position;
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	return derivatives.lambda;
}

fn visualizeFlatShading(primitive: Primitive, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec3f = primitive.vertex0Position.xyz;
	let b: vec3f = primitive.vertex1Position.xyz;
	let c: vec3f = primitive.vertex2Position.xyz;
	let surface: vec3f = vec3f(ndc(uv), (a.z + b.z + c.z) / 3);

	let normal: vec3f = normalize(cross(b - a, c - a));
	const lightPosition: vec3f = vec3f(1, 1, 1);
	let surfaceToLight: vec3f = normalize(lightPosition);

	let shade: f32 = max(dot(surfaceToLight, normal), 0);
	const color: vec3f = vec3f(0.5, 0.7, 0.3);

	return color * shade;
}

fn visualizeBlinnPhongShading(primitive: Primitive, uv: vec2f, world: mat4x4f) -> vec3f {
	let a: vec4f = view.viewProjection * world * primitive.vertex0Position;
	let b: vec4f = view.viewProjection * world * primitive.vertex1Position;
	let c: vec4f = view.viewProjection * world * primitive.vertex2Position;
	let p: vec2f = ndc(uv);

	let derivatives: BarycentricDerivatives = computeBarycentricDerivatives(a, b, c, p, vec2f(view.viewport.zw));

	var fragPos: vec3f = interpolate3x3(derivatives, primitive.vertex0Position.xyz, primitive.vertex1Position.xyz, primitive.vertex2Position.xyz);
	fragPos = (world * vec4f(fragPos, 1)).xyz;

	// TODO: Use normal matrix from geometry
	var normal: vec3f = interpolate3x3(derivatives, primitive.vertex0Normal, primitive.vertex1Normal, primitive.vertex2Normal);
	normal = (world * vec4f(normal, 0)).xyz;

	let lightPosition: vec3f = view.position;
	const ambient: f32 = 0.1;
	const objectColor: vec3f = vec3f(0.4, 0.4, 0.7);
	const lightColor: vec3f = vec3f(1, 1, 1);
	const shininess: f32 = 300;

	let lightDirection: vec3f = normalize(lightPosition - fragPos);

	let diffuse: f32 = max(dot(normal, lightDirection), 0);

	const ambientVec: vec3f = lightColor * ambient;
	let diffuseVec: vec3f = lightColor * diffuse;

	let viewDirection: vec3f = normalize(view.position - fragPos);
	let halfwayDirection: vec3f = normalize(lightDirection + viewDirection);

	let specular: f32 = pow(max(dot(normal, halfwayDirection), 0), shininess) * 4;
	let specularVec: vec3f = lightColor * specular;

	return objectColor * (ambientVec + diffuseVec + specularVec);
}