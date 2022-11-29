#version 300 es

layout(location = 0) in vec2 position;

out vec2 v_uv;

void main() {
	gl_Position = vec4(position, 0, 1);

	v_uv = clamp(position, vec2(0), vec2(1));
}