@group(0) @binding(0) var visibilityTexture: texture_storage_2d<rg32uint, read>;

struct Input {
	@builtin(position) position: vec4f,
}

const far: f32 = 1000;

@fragment
fn main(input: Input) -> @location(0) vec4f {
	let uv: vec2u = vec2u(input.position.xy);

	let visibility: vec2u = textureLoad(visibilityTexture, uv).xy;
	// let depth: f32 = f32(textureLoad(depthTexture, uv).r);
	let instanceIndex: u32 = visibility.r >> 7;
	let triangleIndex: u32 = visibility.r & 0x7f;
	let depth: f32 = f32(visibility.g) / far;

	return vec4f(f32(triangleIndex) / 6);
}

/* void UnpackVisPixel(
	UlongType Pixel,
	out uint DepthInt,
	out uint VisibleClusterIndex, 
	out uint TriIndex
	)
{
	const uint2 Unpacked = UnpackUlongType(Pixel);
	VisibleClusterIndex = Unpacked.x >> 7;
	TriIndex = Unpacked.x & 0x7F;
	DepthInt = Unpacked.y;

	VisibleClusterIndex--;
} */