struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
	@location(1) @interpolate(flat) textureIndex: u32,
	@location(2) textureMatrix0: vec3f,
	@location(3) textureMatrix1: vec3f,
	@location(4) textureMatrix2: vec3f,
}