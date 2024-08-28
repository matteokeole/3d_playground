#version 300 es

#ifdef VERTEX_SHADER
	layout(location = 0) in vec3 a_position;

	void main() {
		gl_Position = vec4(a_position, 1);
	}
#endif

#ifdef FRAGMENT_SHADER
	precision mediump float;

	uniform vec3 u_color;

	out vec4 FragColor;

	void main() {
		FragColor = vec4(u_color, 1);
	}
#endif