#version 300 es

struct Camera {
	mat4 projection;
	mat4 view;
	vec3 position;
};

layout(location = 0) in vec4 a_vertex;
in vec2 a_uv;

uniform Camera u_camera;

void main() {
	gl_Position = u_camera.projection * u_camera.view * a_vertex;
}