#version 300 es

precision mediump float;
precision mediump sampler2DArray;

in vec2 v_uv;
in vec3 v_surface_to_camera;
in vec3 v_surface_to_light;
flat in uint v_texture_index;
flat in uint v_normal_map_index;

uniform mat3 u_texture_matrix;
uniform sampler2DArray u_textures;
uniform vec3 u_light_color;
uniform float u_light_intensity;

out vec4 FragColor;

void main() {
	vec2 uv = (u_texture_matrix * vec3(v_uv, 1)).xy;

	FragColor = texture(u_textures, vec3(uv, v_texture_index));

	vec3 normal = texture(u_textures, vec3(uv, v_normal_map_index)).rgb;
	normal = normal * 2.0 - 1.0;
	normal = normalize(normal);

	vec3 surface_to_camera = normalize(v_surface_to_camera);
	vec3 surface_to_light = normalize(v_surface_to_light);
	vec3 half_vector = normalize(surface_to_camera + surface_to_light);

	float light = max(dot(surface_to_light, normal), .0);
	float specular = pow(dot(half_vector, normal), 300.0);

	FragColor.rgb *= u_light_color * light * u_light_intensity;
	FragColor.rgb += specular;
}