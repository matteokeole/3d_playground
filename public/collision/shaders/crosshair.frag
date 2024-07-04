#version 300 es

precision mediump float;

out vec4 FragColor;

const vec4 CROSSHAIR_COLOR = vec4(1, .82, .25, 1);

void main() {
	FragColor = CROSSHAIR_COLOR;
}