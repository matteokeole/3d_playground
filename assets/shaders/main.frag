#version 300 es

precision mediump float;

const float AMBIENT_LIGHT = 0.;

in vec3 v_normal;
in vec2 v_uv;

uniform sampler2D u_sampler;
uniform vec3 u_light_direction;
uniform vec3 u_light_color;
uniform float u_light_intensity;

out vec4 FragColor;

void main() {
	vec3 normal = normalize(v_normal);
	vec3 light_direction = normalize(u_light_direction);

	float light = max(dot(light_direction, normal), 0.);

	FragColor = texture(u_sampler, v_uv);

	float diffuse = AMBIENT_LIGHT + light;

	FragColor.rgb *= u_light_color * u_light_intensity * diffuse;
}