#version 300 es

precision mediump float;

out vec4 FragColor;

// const vec3 COLOR = vec3(.98, .663, .325);
const vec3 COLOR = vec3(1);

void main() {
	FragColor = vec4(COLOR, 1);
}