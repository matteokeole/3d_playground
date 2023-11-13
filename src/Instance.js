import {Renderer} from "./Renderer/index.js";

/**
 * @typedef {Object} InstanceDescriptor
 * @property {Renderer} renderer
 * @property {Number} framesPerSecond
 */

export class Instance {
	/**
	 * @type {Renderer}
	 */
	#renderer;

	/**
	 * @type {Number}
	 */
	#framesPerSecond;

	/**
	 * @type {Number}
	 */
	#frameInterval;

	/**
	 * @param {Number}
	 */
	#timeSinceLastFrame;

	/**
	 * @type {?Number}
	 */
	#animationFrameRequestId;

	/**
	 * @param {InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#renderer = descriptor.renderer;
		this.#framesPerSecond = descriptor.framesPerSecond;
		this.#frameInterval = 1000 / this.#framesPerSecond;
		this.#timeSinceLastFrame = 0;
		this.#animationFrameRequestId = null;
	}

	loop() {
		this.#loop();
	}

	#loop() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop.bind(this));

		const time = performance.now();
		const delta = time - this.#timeSinceLastFrame;

		if (delta > this.#frameInterval) {
			this.#timeSinceLastFrame = time;

			try {
				// console.log("updating");
			} catch (error) {
				console.error(error);

				this.dispose();
			}
		}
	}

	dispose() {
		cancelAnimationFrame(this.#animationFrameRequestId);

		this.#animationFrameRequestId = null;
	}
}