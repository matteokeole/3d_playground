#version 300 es

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in mat4 a_world;

uniform mat4 u_projection;
uniform mat4 u_camera;
uniform vec3 u_lightDirection;

out vec2 v_uv;
out float v_brightness;

void main() {
	gl_Position = u_projection * u_camera * a_world * a_position;

	v_uv = a_uv;
	v_brightness = max(dot(normalize(u_lightDirection), a_normal), .0);
}