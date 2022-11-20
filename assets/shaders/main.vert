#version 300 es

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in mat4 a_matrix;

out vec2 v_uv;

void main() {
	gl_Position = a_matrix * a_position;

	v_uv = a_uv;
}