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

fn computeBarycentricCoordinates(a: vec3f, b: vec3f, c: vec3f, p: vec3f) -> vec3f {
	let v0: vec3f = b - a;
	let v1: vec3f = c - a;
	let v2: vec3f = p - a;

	let d00: f32 = dot(v0, v0);
	let d01: f32 = dot(v0, v1);
	let d11: f32 = dot(v1, v1);
	let d20: f32 = dot(v2, v0);
	let d21: f32 = dot(v2, v1);
	let denom: f32 = d00 * d11 - d01 * d01;

	let v: f32 = (d11 * d20 - d01 * d21) / denom;
	let w: f32 = (d00 * d21 - d01 * d20) / denom;
	let u: f32 = 1 - v - w;

	return vec3f(u, v, w);
}

// uv is NDC (Normalized Device Coordinates)
// viewport[0] is width
// viewport[1] is height
fn computeBarycentricDerivatives(v0: vec4f, v1: vec4f, v2: vec4f, uv: vec2f, viewport: vec2f) -> BarycentricDerivatives {
	var barycentricDerivatives: BarycentricDerivatives;

	let invW: vec3f = rcpvec3f(vec3f(v0.w, v1.w, v2.w));

	let ndc0: vec2f = v0.xy * invW.x;
	let ndc1: vec2f = v1.xy * invW.y;
	let ndc2: vec2f = v2.xy * invW.z;

	let invDet: f32 = rcpf32(determinant(mat2x2f(ndc2 - ndc1, ndc0 - ndc1)));

	barycentricDerivatives.ddx = vec3f(ndc1.y - ndc2.y, ndc2.y - ndc0.y, ndc0.y - ndc1.y) * invDet * invW;
	barycentricDerivatives.ddy = vec3f(ndc2.x - ndc1.x, ndc0.x - ndc2.x, ndc1.x - ndc0.x) * invDet * invW;

	var ddxSum: f32 = dot(barycentricDerivatives.ddx, vec3f(1, 1, 1));
	var ddySum: f32 = dot(barycentricDerivatives.ddy, vec3f(1, 1, 1));

	let deltaVec: vec2f = uv - ndc0;
	let interpInvW: f32 = invW.x + deltaVec.x*ddxSum + deltaVec.y*ddySum;
	let interpW: f32 = rcpf32(interpInvW);

	barycentricDerivatives.lambda.x = interpW * (invW[0] + deltaVec.x*barycentricDerivatives.ddx.x + deltaVec.y*barycentricDerivatives.ddy.x);
	barycentricDerivatives.lambda.y = interpW * (0.0f    + deltaVec.x*barycentricDerivatives.ddx.y + deltaVec.y*barycentricDerivatives.ddy.y);
	barycentricDerivatives.lambda.z = interpW * (0.0f    + deltaVec.x*barycentricDerivatives.ddx.z + deltaVec.y*barycentricDerivatives.ddy.z);

	barycentricDerivatives.ddx *= (2.0f/viewport.x);
	barycentricDerivatives.ddy *= (2.0f/viewport.y);
	ddxSum    *= (2.0f/viewport.x);
	ddySum    *= (2.0f/viewport.y);

	barycentricDerivatives.ddy *= -1.0f;
	ddySum    *= -1.0f;

	let interpW_ddx: f32 = 1.0f / (interpInvW + ddxSum);
	let interpW_ddy: f32 = 1.0f / (interpInvW + ddySum);

	barycentricDerivatives.ddx = interpW_ddx*(barycentricDerivatives.lambda*interpInvW + barycentricDerivatives.ddx) - barycentricDerivatives.lambda;
	barycentricDerivatives.ddy = interpW_ddy*(barycentricDerivatives.lambda*interpInvW + barycentricDerivatives.ddy) - barycentricDerivatives.lambda;

	return barycentricDerivatives;
}

fn interpolateWithBarycentricDerivatives(derivatives: BarycentricDerivatives, mergedV: vec3f) -> vec3f {
	return vec3f(
		dot(mergedV, derivatives.lambda),
		dot(mergedV, derivatives.ddx),
		dot(mergedV, derivatives.ddy),
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

// Calculates perspective correct barycentric coordinates and partial derivatives using screen derivatives.
/* FBarycentrics CalculateTriangleBarycentrics(float2 PixelClip, float4 PointClip0, float4 PointClip1, float4 PointClip2, float2 ViewInvSize)
{
	FBarycentrics Barycentrics;

	const float3 RcpW = rcp(float3(PointClip0.w, PointClip1.w, PointClip2.w));
	const float3 Pos0 = PointClip0.xyz * RcpW.x;
	const float3 Pos1 = PointClip1.xyz * RcpW.y;
	const float3 Pos2 = PointClip2.xyz * RcpW.z;

	const float3 Pos120X = float3(Pos1.x, Pos2.x, Pos0.x);
	const float3 Pos120Y = float3(Pos1.y, Pos2.y, Pos0.y);
	const float3 Pos201X = float3(Pos2.x, Pos0.x, Pos1.x);
	const float3 Pos201Y = float3(Pos2.y, Pos0.y, Pos1.y);

	const float3 C_dx = Pos201Y - Pos120Y;
	const float3 C_dy = Pos120X - Pos201X;

	const float3 C = C_dx * (PixelClip.x - Pos120X) + C_dy * (PixelClip.y - Pos120Y);	// Evaluate the 3 edge functions
	const float3 G = C * RcpW;

	const float H = dot(C, RcpW);
	const float RcpH = rcp(H);

	// UVW = C * RcpW / dot(C, RcpW)
	Barycentrics.Value = G * RcpH;

	// Texture coordinate derivatives:
	// UVW = G / H where G = C * RcpW and H = dot(C, RcpW)
	// UVW' = (G' * H - G * H') / H^2
	// float2 TexCoordDX = UVW_dx.y * TexCoord10 + UVW_dx.z * TexCoord20;
	// float2 TexCoordDY = UVW_dy.y * TexCoord10 + UVW_dy.z * TexCoord20;
	const float3 G_dx = C_dx * RcpW;
	const float3 G_dy = C_dy * RcpW;

	const float H_dx = dot(C_dx, RcpW);
	const float H_dy = dot(C_dy, RcpW);

	Barycentrics.Value_dx = (G_dx * H - G * H_dx) * (RcpH * RcpH) * ( 2.0f * ViewInvSize.x);
	Barycentrics.Value_dy = (G_dy * H - G * H_dy) * (RcpH * RcpH) * (-2.0f * ViewInvSize.y);

	return Barycentrics;
} */

fn computeBarycentricCoordinates2(P: vec3<f32>, V0: vec3<f32>, V1: vec3<f32>, V2: vec3<f32>) -> vec3<f32> {
    let v0v1 = V1 - V0;
    let v0v2 = V2 - V0;
    let v0p = P - V0;
    
    // Calculate the cross products
    let crossV0V1V0V2 = cross(v0v1, v0v2);
    let crossV0PV0V2 = cross(v0p, v0v2);
    let crossV0V1V0P = cross(v0v1, v0p);
    
    // Calculate the areas
    let areaTotal = length(crossV0V1V0V2);
    let area1 = length(crossV0PV0V2);
    let area2 = length(crossV0V1V0P);
    
    // Calculate barycentric coordinates
    let b1 = area1 / areaTotal;
    let b2 = area2 / areaTotal;
    let b0 = 1.0 - b1 - b2;
    
    return vec3<f32>(b0, b1, b2);
}