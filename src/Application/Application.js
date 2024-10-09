import {NotImplementedError} from "../Error/index.js";
import {Layer} from "../Layer/index.js";

export class Application {
	/**
	 * @returns {Application}
	 */
	static create() {
		throw new NotImplementedError();
	}

	/**
	 * @type {Layer[]}
	 */
	#layers = [];

	#timeSinceLastFrame = 0;

	/**
	 * @param {Layer} layer
	 */
	pushLayer(layer) {
		this.#layers.push(layer);
	}

	loop() {
		const requestId = window.requestAnimationFrame(this.loop.bind(this));

		const time = performance.now();
		const deltaTime = time - this.#timeSinceLastFrame;

		this.#timeSinceLastFrame = time;

		try {
			for (const layer of this.#layers) {
				layer.update(deltaTime);
			}
		} catch (error) {
			console.error(error);

			window.cancelAnimationFrame(requestId);
		}
	}
}