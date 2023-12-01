#version 300 es

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;

uniform mat4 u_lightProjection;

void main() {
	gl_Position = u_lightProjection * a_world * a_vertex;
}