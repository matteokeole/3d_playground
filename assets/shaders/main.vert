#version 300 es

in vec4 a_position;
in vec2 a_uv;

uniform mat4 u_matrix;

out vec2 v_uv;

void main() {
	gl_Position = u_matrix * a_position;

	v_uv = a_uv;
}