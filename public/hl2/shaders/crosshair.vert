#version 300 es

const vec2 VERTICES[] = vec2[](
	vec2( 1,   0),
	vec2( 21,  0),
	vec2( 1,  -20),
	vec2(-19,  0),
	vec2( 1,   20)
);

uniform vec2 u_viewport;

void main() {
	vec2 vertex = VERTICES[gl_VertexID];

	gl_PointSize = 1.;
	gl_Position = vec4(vertex / u_viewport, 0, 1);
}