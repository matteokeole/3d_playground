#version 300 es

precision mediump float;

in vec4 v_position;
in vec3 v_normal;
in vec2 v_uv;

uniform sampler2D u_sampler;

out vec4 FragData[3];

void main() {
	FragData[0] = v_position;
	FragData[1] = vec4(normalize(v_normal), 1);
	FragData[2] = texture(u_sampler, v_uv);
}