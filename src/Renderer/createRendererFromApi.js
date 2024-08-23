import {Renderer, WebGLRenderer, WebGPURenderer} from "./index.js";

/**
 * @param {HTMLCanvasElement} canvas
 * @param {String} apiName
 * @returns {Renderer}
 */
export function createRendererFromApi(canvas, apiName) {
	switch (apiName) {
		case "webgl":
			return new WebGLRenderer(canvas);
		case "webgpu":
			return new WebGPURenderer(canvas);
		default:
			throw new Error(`Unknown API "${apiName}".`);
	}
}

/**
 * @param {HTMLCanvasElement} canvas
 */
export function createRendererFromRandomApi(canvas) {
	const apiNames = ["webgl", "webgpu"];
	const apiName = apiNames[Math.floor(Math.random() * apiNames.length)];

	return createRendererFromApi(canvas, apiName);
}