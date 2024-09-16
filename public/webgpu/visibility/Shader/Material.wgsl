struct BarycentricDerivatives {
	lambda: vec3f,
	ddx: vec3f,
	ddy: vec3f,
}

struct TrianglePosition {
	pos0: vec3f,
	pos1: vec3f,
	pos2: vec3f,
}

fn fetchTriangleIndices(instanceIndex: u32, triangleIndex: u32) -> vec3f {
	let startIndex: u32 = instanceBuffer[instanceIndex].visibilityStartIndexPositionGeometryMaterialIndex.x;

	return visibilityIndexBuffer[startIndex + 3 * 4 * triangleIndex];
}

fn fetchTrianglePosition(instanceIndex: u32, triangleIndices: vec3f) -> TrianglePosition {
	let startPos: u32 = instanceBuffer[instanceIndex].visibilityStartIndexPositionGeometryMaterialIndex.y;

	var trianglePosition: TrianglePosition;
	trianglePosition.pos0.xyz = vec3f(visibilityPositionBuffer[startPos + 12 * triangleIndices.x]);
	trianglePosition.pos1.xyz = vec3f(visibilityPositionBuffer[startPos + 12 * triangleIndices.y]);
	trianglePosition.pos2.xyz = vec3f(visibilityPositionBuffer[startPos + 12 * triangleIndices.z]);

	return trianglePosition;
}

fn calculateBarycentricDerivatives(v0: vec4f, v1: vec4f, v2: vec4f, uv: vec2f, viewport: vec2f) -> BarycentricDerivatives {
	var deriv: BarycentricDerivatives;

	let invW: vec3f = rcpvec3f(vec3f(v0.w, v1.w, v2.w));

	let ndc0: vec2f = v0.xy * invW.x;
	let ndc1: vec2f = v1.xy * invW.y;
	let ndc2: vec2f = v2.xy * invW.z;

	let invDet: f32 = rcpf32(determinant(mat2x2f(ndc2 - ndc1, ndc0 - ndc1)));

	deriv.ddx = vec3f(ndc1.y - ndc2.y, ndc2.y - ndc0.y, ndc0.y - ndc1.y) * invDet * invW;
	deriv.ddy = vec3f(ndc2.x - ndc1.x, ndc0.x - ndc2.x, ndc1.x - ndc0.x) * invDet * invW;

	var ddxSum: f32 = dot(deriv.ddx, vec3f(1, 1, 1));
	var ddySum: f32 = dot(deriv.ddy, vec3f(1, 1, 1));

	let deltaVec: vec2f = uv - ndc0;
	let interpInvW: f32 = invW.x + deltaVec.x*ddxSum + deltaVec.y*ddySum;
	let interpW: f32 = rcpf32(interpInvW);

	deriv.lambda.x = interpW * (invW[0] + deltaVec.x*deriv.ddx.x + deltaVec.y*deriv.ddy.x);
	deriv.lambda.y = interpW * (0.0f    + deltaVec.x*deriv.ddx.y + deltaVec.y*deriv.ddy.y);
	deriv.lambda.z = interpW * (0.0f    + deltaVec.x*deriv.ddx.z + deltaVec.y*deriv.ddy.z);

	deriv.ddx *= (2.0f/viewport.x);
	deriv.ddy *= (2.0f/viewport.y);
	ddxSum    *= (2.0f/viewport.x);
	ddySum    *= (2.0f/viewport.y);

	deriv.ddy *= -1.0f;
	ddySum    *= -1.0f;

	let interpW_ddx: f32 = 1.0f / (interpInvW + ddxSum);
	let interpW_ddy: f32 = 1.0f / (interpInvW + ddySum);

	deriv.ddx = interpW_ddx*(deriv.lambda*interpInvW + deriv.ddx) - deriv.lambda;
	deriv.ddy = interpW_ddy*(deriv.lambda*interpInvW + deriv.ddy) - deriv.lambda;  

	return deriv;
}

fn interpolateWithBarycentricDerivatives(BarycentricDerivatives derivatives, v0: f32, v1: f32, v2: f32) -> vec3f {
	let mergedVertex: vec3f = vec3f(v0, v1, v2);

	return vec3f(
		dot(mergedVertex, derivatives.lambda),
		dot(mergedVertex, derivatives.ddx),
		dot(mergedVertex, derivatives.ddy),
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