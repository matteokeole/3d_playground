#version 300 es

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;
layout(location = 5) in vec3 a_normal;
layout(location = 6) in vec2 a_uv;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_view_inverse_transpose;

out vec4 v_position;
out vec3 v_normal;
out vec2 v_uv;
out float v_depth;

void main() {
	vec4 position = vec4(a_world * a_vertex);

	gl_Position = u_projection * u_view * position;

	v_position = position;
	v_normal = a_vertex.xyz * a_normal;
	v_uv = a_uv;
	v_depth = gl_Position.z / gl_Position.w;
}