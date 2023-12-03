#version 300 es

uniform vec2 u_viewport;

const vec2 VERTICES[5] = vec2[5](
	vec2( 1,   0),
	vec2( 21,  0),
	vec2( 1,  -20),
	vec2(-19,  0),
	vec2( 1,   20)
);

void main() {
	vec2 vertex = VERTICES[gl_VertexID];

	gl_PointSize = 1.;
	gl_Position = vec4(vertex / u_viewport, 0, 1);
}