@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(1) var visibilityTexture: texture_storage_2d<rg32uint, read>;
@group(2) @binding(3) var<storage, read> clusterBuffer: array<Cluster>;
@group(3) @binding(0) var<storage, read_write> materialCountBuffer: array<atomic<u32>>;

struct View {
	viewport: vec4u,
	viewProjection: mat4x4f,
	position: vec3f,
}

struct Cluster {
	meshIndex: u32,
	materialIndex: u32,
}

struct Input {
	@builtin(global_invocation_id) globalInvocationId: vec3u,
}

const VISIBILITY_CLUSTER_MASK: u32 = 7;

@compute
@workgroup_size(8, 8, 1)
fn main(input: Input) {
	let position: vec2u = input.globalInvocationId.xy;

	if (any(position >= view.viewport.zw)) {
		return;
	}

	let visibility: u32 = textureLoad(visibilityTexture, position).r;

	if (visibility == 0) {
		return;
	}

	let clusterIndex: u32 = (visibility >> VISIBILITY_CLUSTER_MASK) - 1;
	let cluster: Cluster = clusterBuffer[clusterIndex];

	let materialIndex: u32 = cluster.materialIndex;

	atomicAdd(&materialCountBuffer[materialIndex], 1);
}