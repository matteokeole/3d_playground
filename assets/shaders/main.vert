#version 300 es

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;
layout(location = 5) in vec3 a_normal;
layout(location = 6) in vec2 a_uv;

uniform mat4 u_projection;
uniform mat4 u_view;

out vec3 v_normal;
out vec2 v_uv;

void main() {
	gl_Position = u_projection * u_view * a_world * a_vertex;

	v_normal = a_normal;
	v_uv = a_uv;
}