#version 300 es

const vec2 VERTICES[4] = vec2[4](
	vec2(-1,  1),
	vec2( 1,  1),
	vec2( 1, -1),
	vec2(-1, -1)
);

out vec2 v_uv;

void main() {
	vec2 vertex = VERTICES[gl_VertexID];

	gl_Position = vec4(vertex, 0, 1);

	v_uv = vertex;
}