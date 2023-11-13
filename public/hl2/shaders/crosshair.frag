#version 300 es

precision mediump float;

const vec4 CROSSHAIR_COLOR = vec4(1, .82, .25, 1);

out vec4 FragColor;

void main() {
	FragColor = CROSSHAIR_COLOR;
}