#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_position_sampler;
uniform sampler2D u_normal_sampler;
uniform sampler2D u_color_sampler;
uniform sampler2D u_depth_sampler;
uniform vec3 u_light_direction;
uniform vec3 u_light_color;
uniform float u_light_intensity;

out vec4 FragColor;

void main() {
	vec4 position = texture(u_position_sampler, v_uv);
	vec3 normal = texture(u_normal_sampler, v_uv).xyz;
	vec4 color = texture(u_color_sampler, v_uv);
	float depth = texture(u_depth_sampler, v_uv).r;

	vec3 light_direction = normalize(u_light_direction);
	float light = max(dot(light_direction, normal), 0.);

	FragColor = color;
	FragColor.rgb *= light * u_light_color * u_light_intensity;
}