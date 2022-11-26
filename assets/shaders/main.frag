#version 300 es

precision mediump float;

in vec2 v_uv;
in float v_brightness;

uniform sampler2D u_texture;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;

out vec4 FragColor;

void main() {
	vec3 texture = texture(u_texture, v_uv).rgb * u_lightColor * u_lightIntensity;

	FragColor = vec4(texture * v_brightness, 1);
}