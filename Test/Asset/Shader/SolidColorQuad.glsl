#version 300 es

const vec2 VERTICES[4] = vec2[4](
	vec2(-1.0f,  1.0f),
	vec2( 1.0f,  1.0f),
	vec2( 1.0f, -1.0f),
	vec2(-1.0f, -1.0f)
);

#ifdef VERTEX_SHADER
	void main() {
		uint vertexIndex = gl_VertexID;
		vec2 vertex = VERTICES[vertexIndex];

		gl_Position = vec4(vertex, 0.0f, 1.0f);
	}
#endif

#ifdef FRAGMENT_SHADER
	uniform vec3 u_color;

	out vec4 FragColor;

	void main() {
		FragColor = vec4(u_color, 1.0f);
	}
#endif