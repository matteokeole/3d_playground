#version 300 es

precision mediump float;
precision mediump sampler2DShadow;

in vec2 v_uv;

uniform sampler2DShadow u_sampler;

out vec4 FragColor;

void main() {
	float depth = texture(u_sampler, vec3(v_uv, 1));

	FragColor = vec4(vec3(depth), 1);
}