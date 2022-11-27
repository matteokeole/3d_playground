#version 300 es

precision mediump float;

in vec2 v_uv;
in float v_brightness;

uniform sampler2D u_texture;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;

out vec4 FragColor;

const float ambient = .0;

void main() {
	vec3 texture = texture(u_texture, v_uv).rgb;
	vec3 lightColor = u_lightColor * u_lightIntensity;
	float diffuse = ambient + v_brightness;

	FragColor = vec4(texture * lightColor * diffuse, 1);
}