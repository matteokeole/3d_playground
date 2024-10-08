@group(0) @binding(0) var<storage, read_write> materialCountBuffer: array<atomic<u32>>; // TODO: See CPU-side comment about atomic access mode
@group(0) @binding(1) var<storage, read_write> materialStartBuffer: array<atomic<u32>>;
@group(0) @binding(2) var<storage, read> totalMaterialCount: u32;

// TODO: Replace by implementation of "Single-pass Parallel Prefix Scan with Decoupled Look-back"
// (https://research.nvidia.com/sites/default/files/pubs/2016-03_Single-pass-Parallel-Prefix/nvr-2016-002.pdf)
// 
// Exclusive prefix sum example:
//   [1, 2,     3        ]
// = [0, 0 + 1, 0 + 1 + 2]
// = [0, 1,     3        ]
@compute
@workgroup_size(1, 1, 1)
fn main() {
	var accumulate: u32 = 0;

	for (var i: u32 = 0; i < totalMaterialCount; i++) {
		let originalValue: u32 = atomicLoad(&materialCountBuffer[i]);

		atomicStore(&materialStartBuffer[i], accumulate);

		accumulate += originalValue;
	}
}