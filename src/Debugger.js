export class Debugger {
	/**
	 * @type {HTMLElement}
	 */
	positionElement;

	/**
	 * @type {HTMLElement}
	 */
	rotationElement;

	/**
	 * @type {HTMLElement}
	 */
	debugElement;

	constructor() {
		const container = document.createElement("div");
		this.positionElement = document.createElement("span");
		this.rotationElement = document.createElement("span");
		this.debugElement = document.createElement("span");

		container.className = "debug";
		this.positionElement.id = "DebugPosition";
		this.rotationElement.id = "DebugRotation";

		container.appendChild(this.positionElement);
		container.appendChild(this.rotationElement);
		container.appendChild(this.debugElement);
		document.body.appendChild(container);
	}

	/**
	 * @param {Record.<String, *>} properties
	 */
	update(properties) {
		for (const [name, value] of Object.entries(properties)) {
			this[name].textContent = value;
		}
	}
}