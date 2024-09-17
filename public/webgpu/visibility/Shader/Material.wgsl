struct BarycentricDerivatives {
	lambda: vec3f,
	ddx: vec3f,
	ddy: vec3f,
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