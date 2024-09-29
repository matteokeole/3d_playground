import {Debugger} from "./index.js";
import {Renderer} from "./Renderer/index.js";

/**
 * @typedef {Object} InstanceDescriptor
 * @property {Renderer} renderer
 * @property {Number} framesPerSecond
 * @property {Debugger} [debugger]
 */

export class Instance {
	/**
	 * @type {Renderer}
	 */
	_renderer;

	/**
	 * @type {Number}
	 */
	_frameIndex;

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
	#lastFrameTime;

	/**
	 * @type {?Number}
	 */
	#animationFrameRequestId;

	/**
	 * @type {Debugger}
	 */
	#debugger;

	/**
	 * @type {Record.<String, Boolean>}
	 */
	#activeKeyCodes;

	/**
	 * @param {InstanceDescriptor} descriptor
	 */
	constructor(descriptor) {
		this._renderer = descriptor.renderer;
		this._frameIndex = 0;
		this.#framesPerSecond = descriptor.framesPerSecond;
		this.#frameInterval = 1000 / this.#framesPerSecond;
		this.#lastFrameTime = -this.#frameInterval;
		this.#animationFrameRequestId = null;
		this.#debugger = new Debugger();

		this.#activeKeyCodes = {};
	}

	getDebugger() {
		return this.#debugger;
	}

	getHorizontalRawAxis() {
		if (this.#activeKeyCodes["KeyD"] || this.#activeKeyCodes["ArrowRight"]) {
			return 1;
		}

		if (this.#activeKeyCodes["KeyA"] || this.#activeKeyCodes["ArrowLeft"]) {
			return -1;
		}

		return 0;
	}

	getVerticalRawAxis() {
		if (this.#activeKeyCodes["KeyW"] || this.#activeKeyCodes["ArrowUp"]) {
			return 1;
		}

		if (this.#activeKeyCodes["KeyS"] || this.#activeKeyCodes["ArrowDown"]) {
			return -1;
		}

		return 0;
	}

	/**
	 * @param {MouseEvent} event
	 */
	getMouseXAxis(event) {
		return event.movementX;
	}

	/**
	 * @param {MouseEvent} event
	 */
	getMouseYAxis(event) {
		return event.movementY;
	}

	async build() {
		await this._renderer.build();

		document.addEventListener("keydown", this.#onKeyDown.bind(this));
		document.addEventListener("keyup", this.#onKeyUp.bind(this));
	}

	loop() {
		this.#loop();
	}

	/**
	 * @abstract
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {}

	/**
	 * @abstract
	 */
	_render() {}

	#loop() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop.bind(this));

		const time = performance.now();
		const deltaTime = (time - this.#lastFrameTime) / 1000;

		this.#lastFrameTime = time;

		// if (deltaTime > this.#frameInterval) {
			try {
				this._update(deltaTime);
				this._render();

				this._frameIndex++;
			} catch (error) {
				console.error(error);

				this.dispose();
			}
		// }
	}

	dispose() {
		cancelAnimationFrame(this.#animationFrameRequestId);

		this.#animationFrameRequestId = null;
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	#onKeyDown(event) {
		const keyCode = event.code;

		this.#activeKeyCodes[keyCode] = true;
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	#onKeyUp(event) {
		const keyCode = event.code;

		this.#activeKeyCodes[keyCode] = false;
	}
}