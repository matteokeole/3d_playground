import {AssertionError, NotImplementedError} from "../Error/index.js";
import {WebGLRenderer} from "../Platform/WebGL/Renderer/index.js";
import {WebGPURenderer} from "../Platform/WebGPU/Renderer/index.js";
import {Renderer} from "../Renderer/index.js";

/**
 * @abstract
 */
export class Test {
	static #API_NAMES = ["webgl", "webgpu"];

	/**
	 * @abstract
	 */
	async execute() {
		throw new NotImplementedError();
	}

	/**
	 * @param {Boolean} condition
	 * @param {String} [message]
	 */
	assert(condition, message) {
		if (!condition) {
			throw new AssertionError(message);
		}
	}

	createTestCanvas() {
		const canvas = document.createElement("canvas");

		document.body.appendChild(canvas);

		return canvas;
	}

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {String} apiName
	 * @returns {Renderer}
	 */
	createRendererFromApi(canvas, apiName) {
		switch (apiName) {
			case Test.#API_NAMES[0]:
				return new WebGLRenderer(canvas);
			case Test.#API_NAMES[1]:
				return new WebGPURenderer(canvas);
			default:
				throw new Error(`Unknown API "${apiName}".`);
		}
	}

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	createRendererFromRandomApi(canvas) {
		const apiName = Test.#API_NAMES[Math.floor(Math.random() * Test.#API_NAMES.length)];

		return this.createRendererFromApi(canvas, apiName);
	}
}