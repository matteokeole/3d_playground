@group(2) @binding(0) var depthTexture: texture_storage_2d<r32uint, read_write>;
@group(2) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, write>;

struct Input {
	@builtin(position) position: vec4f,
	@location(0) @interpolate(flat) instanceIndex: u32,
	@location(1) @interpolate(flat) triangleIndex: u32,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) {
	let uv: vec2u = vec2u(input.position.xy);
	let visibility: u32 = ((input.instanceIndex + 1) << 7) | input.triangleIndex;
	let sampledDepth: f32 = f32(textureLoad(depthTexture, uv).r) / far;
	let depth: f32 = input.position.w * far;

	if (depth > sampledDepth) {
		textureStore(visibilityTexture, uv, vec4u(visibility, u32(depth), 0, 1));
		textureStore(depthTexture, uv, vec4u(u32(depth), 0, 0, 1));

		return;
	}

	// float4 SvPosition = float4(In.Position.xy, In.ClipZW.x / In.ClipZW.y, In.ClipZW.y);
	// InterlockedMax = atomicMax
	// atomicMax(visibilityTexture[0]);

	// let uv: vec2u = vec2u(input.position.xy);
	// let visibility: vec2u = textureLoad(visibilityTexture, uv, 0).xy;
	// let previousDepth: u32 = visibility.y;
	// let visibility
	// visibilityTexture[uv] = 2;

	// let depth: u32 = u32(input.position.w * far);

	// Write
	// - WritePixel( OutVisBuffer64, Value, Position, DepthInt );
	// - WritePixel( OutDbgBuffer64, VisualizeValues.x, Position, DepthInt );

	// WriteOverdraw
	// - InterlockedAdd(OutDbgBuffer32[Position], VisualizeValues.y);

	/*
	void WritePixel(
		RWTexture2D<UlongType> OutBuffer,
		uint PixelValue,
		uint2 PixelPos,
		uint DepthInt
	) {
		#if DEPTH_ONLY
			InterlockedMax( OutDepthBuffer[ PixelPos ], DepthInt );
		#elif COMPILER_SUPPORTS_UINT64_IMAGE_ATOMICS
			const UlongType Pixel = PackUlongType(uint2(PixelValue, DepthInt));
			ImageInterlockedMaxUInt64(OutBuffer, PixelPos, Pixel);
		#endif
	}
	*/

	// return vec2u(visibility, depth);
}