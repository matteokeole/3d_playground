#version 300 es

precision mediump float;

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;
layout(location = 5) in vec3 a_normal;
layout(location = 6) in vec2 a_uv;

uniform struct Camera {
	mat4 viewProjection;
	vec3 position;
} u_camera;
uniform struct Light {
	mat4 viewProjection;
	vec3 position;
} u_light;

out struct Output {
	vec4 position;
	vec4 lightSpacePosition;
	vec3 normal;
	vec2 uv;
} v_out;

void main() {
	v_out.position = a_world * a_vertex;
	v_out.lightSpacePosition = u_light.viewProjection * v_out.position;
	v_out.normal = transpose(inverse(mat3(a_world))) * a_normal;
	v_out.uv = a_uv;

	gl_Position = u_camera.viewProjection * v_out.position;
}