#version 300 es

precision mediump float;

in vec4 v_position;
in vec3 v_normal;
in vec2 v_uv;
in float v_depth;

uniform sampler2D u_sampler;

out vec4 FragData[4];

void main() {
	// Position
	FragData[0] = v_position;

	// Normal
	FragData[1] = vec4(normalize(v_normal), 1);

	// Color
	FragData[2] = texture(u_sampler, v_uv);

	// Depth
	FragData[3] = vec4(vec3(v_depth), 1);
}