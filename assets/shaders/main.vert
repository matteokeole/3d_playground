#version 300 es

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in mat4 a_matrix;

uniform mat4 u_projection;
uniform mat4 u_camera;

out vec2 v_uv;

void main() {
	gl_Position = u_projection * u_camera * a_matrix * a_position;

	v_uv = a_uv;
}