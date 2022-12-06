#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;

out vec4 FragColor;

void main() {
	vec4 texture = texture(u_texture, v_uv);

	FragColor = texture;
}