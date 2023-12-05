#version 300 es

layout(location = 0) in vec4 a_vertex;
layout(location = 1) in mat4 a_world;
layout(location = 5) in vec3 a_normal;
layout(location = 6) in vec2 a_uv;

uniform struct Camera {
	mat4 projection;
	mat4 view;
} u_camera;

out vec4 v_position;
out vec4 v_normal;
out vec2 v_uv;

void main() {
	vec4 position = u_camera.view * a_world * a_vertex;

	gl_Position = u_camera.projection * position;

	v_position = position;
	v_normal = vec4(normalize(a_vertex.xyz * a_normal), 1);
	v_uv = a_uv;
}