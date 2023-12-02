#version 300 es

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;

uniform struct Light {
	mat4 viewProjection;
} u_light;

void main() {
	gl_Position = u_light.viewProjection * a_world * a_vertex;
}