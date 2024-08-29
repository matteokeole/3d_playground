struct VertexInput {
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex: u32,
}

/* struct FTriRange
{
	start: u32,
	num: u32,
}

struct FRasterBinMeta
{
	BinSWCount: u32,
	BinHWCount: u32,
	ClusterOffset: u32,
	MaterialFlags: u32,
	MaterialDisplacementCenter: f32,
	MaterialDisplacementMagnitude: f32,
};

const ActiveRasterBin: u32 = 0;
var<storage> RasterBinMeta: array<FRasterBinMeta>;
var<storage> RasterBinData: array<vec2u>; */

@vertex
fn main(in: VertexInput) -> VertexOutput {
	// ClusterIndex = local_invocation_index.x (unwrapping needed if not 1D)

	let index: u32 = indexBuffer[in.vertexIndex];
	let vertex: vec3f = fetchVertex(index);

	let instanceTriangleIndex: u32 = in.vertexIndex / 3;
	// let triangleOffset: u32 = in.instanceIndex * geometry.triangleCount;
	// let triangleIndex: u32 = triangleOffset + instanceTriangleIndex;

	let instance: Instance = instances[in.instanceIndex];

	var out: VertexOutput;
	out.position = view.viewProjection * instance.projection * vec4f(vertex, 1);
	out.instanceIndex = in.instanceIndex;
	out.triangleIndex = instanceTriangleIndex;

	return out;
}

fn fetchVertex(index: u32) -> vec3f {
	let vertexIndex: u32 = index * 3;
	let x: f32 = vertexBuffer[vertexIndex + 0];
	let y: f32 = vertexBuffer[vertexIndex + 1];
	let z: f32 = vertexBuffer[vertexIndex + 2];

	return vec3f(x, y, z);
}

/* fn GetIndexAndTriRangeHW(VisibleIndex: ptr<function, u32>) -> FTriRange {
	let Range: FTriRange = FTriRange(0, 0);

	let RasterBin: vec4u = FetchHWRasterBin(&VisibleIndex);
	*VisibleIndex = RasterBin.x;
	Range.Start = RasterBin.y;
	Range.Num = RasterBin.z - RasterBin.y;

	return Range;
}

fn FetchHWRasterBin(ClusterIndex: u32) -> vec4u {
	let RasterBinOffset: u32 = RasterBinMeta[ActiveRasterBin].ClusterOffset;
	let RasterBinCapacity: u32 = RasterBinMeta[ActiveRasterBin].BinSWCount + RasterBinMeta[ActiveRasterBin].BinHWCount;
	let PackedData: vec2u = RasterBinData[RasterBinOffset + ((RasterBinCapacity - 1) - ClusterIndex)].xy; // HW clusters are written from the top
	let VisibleIndex: u32 = PackedData.x;
	let RangeStart: u32 = PackedData.y >> 16u;
	let RangeEnd: u32 = PackedData.y & 0xffffu;

	return vec4u(VisibleIndex, RangeStart, RangeEnd, RasterBinMeta[ActiveRasterBin].MaterialFlags);
} */