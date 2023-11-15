#version 300 es

struct Camera {
	mat4 projection;
	mat4 view;
	vec3 position;
};

struct Light {
	vec3 position;
};

in vec4 a_vertex;
in vec3 a_normal;
in vec3 a_tangent;
in vec2 a_uv;

uniform Camera u_camera;
uniform Light u_light;

out vec2 v_uv;
out vec3 v_surface_to_camera;
out vec3 v_surface_to_light;

void main() {
	gl_Position = u_camera.projection * u_camera.view * a_vertex;

	vec3 tangent = normalize(a_tangent - dot(a_tangent, a_normal) * a_normal);
	vec3 bitangent = cross(tangent, a_normal);
	mat3 tangent_bitangent_normal = transpose(mat3(tangent, bitangent, a_normal));

	v_uv = a_uv;
	v_surface_to_camera = tangent_bitangent_normal * (u_camera.position - a_vertex.xyz);
	v_surface_to_light = tangent_bitangent_normal * (u_light.position - a_vertex.xyz);
}