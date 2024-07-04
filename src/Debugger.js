import {Camera} from "./index.js";

export class Debugger {
	/**
	 * @type {HTMLElement}
	 */
	#positionElement;

	/**
	 * @type {HTMLElement}
	 */
	#rotationElement;

	constructor() {
		const container = document.createElement("div");
		this.#positionElement = document.createElement("span");
		this.#rotationElement = document.createElement("span");

		container.className = "debug";
		this.#positionElement.id = "DebugPosition";
		this.#rotationElement.id = "DebugRotation";

		container.appendChild(this.#positionElement);
		container.appendChild(this.#rotationElement);
		document.body.appendChild(container);
	}

	/**
	 * @param {Camera} camera
	 */
	update(camera) {
		this.#positionElement.textContent = `${camera.getPosition()}`;
		this.#rotationElement.textContent = `${camera.getRotation()}`;
	}
}