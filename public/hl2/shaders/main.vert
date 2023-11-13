#version 300 es

in vec4 a_vertex;
in vec3 a_normal;
in vec3 a_tangent;
in vec2 a_uv;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform vec3 u_camera_position;
uniform vec3 u_mesh_position;
uniform vec3 u_light_position;

out vec2 v_uv;
out vec3 v_surface_to_camera;
out vec3 v_surface_to_light;

void main() {
	vec3 vertex = u_mesh_position + a_vertex.xyz;

	gl_Position = u_projection * u_view * (a_vertex + vec4(u_mesh_position, 0));

	vec3 tangent = normalize(a_tangent);
	vec3 normal = normalize(a_normal);
	tangent = normalize(tangent - dot(tangent, normal) * normal);
	vec3 bitangent = cross(tangent, normal);

	mat3 tangent_bitangent_normal = transpose(mat3(tangent, bitangent, normal));

	v_uv = a_uv;
	v_surface_to_camera = tangent_bitangent_normal * (u_camera_position - vertex);
	v_surface_to_light = tangent_bitangent_normal * (u_light_position - vertex);
}