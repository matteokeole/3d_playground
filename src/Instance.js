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
	_renderer;

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
		this._renderer = descriptor.renderer;
		this.#framesPerSecond = descriptor.framesPerSecond;
		this.#frameInterval = 1000 / this.#framesPerSecond;
		this.#timeSinceLastFrame = -this.#frameInterval;
		this.#animationFrameRequestId = null;
	}

	async build() {
		await this._renderer.build();
	}

	loop() {
		this.#loop();
	}

	/**
	 * @abstract
	 * @param {Number} delta
	 */
	_update(delta) {}

	/**
	 * @abstract
	 */
	_render() {}

	#loop() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop.bind(this));

		const time = performance.now();
		const delta = time - this.#timeSinceLastFrame;

		if (delta > this.#frameInterval) {
			this.#timeSinceLastFrame = time - delta / this.#frameInterval;

			try {
				this._update(delta);
				this._render();
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