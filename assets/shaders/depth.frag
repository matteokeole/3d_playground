#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_sampler;

out vec4 FragColor;

void main() {
	float depth = texture(u_sampler, v_uv).r;

	FragColor = vec4(vec3(depth), 1);
}