// import {Vector2} from "./";

/**
 * @param {array} position
 * @param {array} size
 * @param {WebGLTexture} texture
 * @param {array} uv
 * @param {number} scale
 */
export function Crosshair({position: [x, y], size: [width, height], texture, uv: [u, v], scale}) {
	this.vertices = new Float32Array([
		0, 0,
		1, 0,
		1, 1,
		0, 1,
	]);
	this.texture = texture;
}