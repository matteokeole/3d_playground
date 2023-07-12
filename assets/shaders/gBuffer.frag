#version 300 es

precision mediump float;

in vec4 v_position;
in vec3 v_normal;
in vec2 v_uv;
in float v_depth;

uniform sampler2D u_sampler;
uniform vec3 u_light_direction;
uniform vec3 u_light_color;
uniform float u_light_intensity;

out vec4 FragData[4];

void main() {
	vec3 normal = normalize(v_normal);
	vec3 light_direction = normalize(u_light_direction);

	float light = max(dot(light_direction, normal), 3.);

	// Position
	FragData[0] = v_position;

	// Normal
	FragData[1] = vec4(normal, 1);

	// Color
	FragData[2] = vec4(texture(u_sampler, v_uv).xyz, 1);

	// Depth
	FragData[3] = vec4(vec3(v_depth), 1);
}