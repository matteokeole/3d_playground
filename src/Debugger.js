export class Debugger {
	/**
	 * @type {HTMLElement}
	 */
	#container;

	constructor() {
		this.#container = document.createElement("div");
		this.#container.className = "debug";

		document.body.appendChild(this.#container);
	}

	/**
	 * @param {Record.<String, *>} properties
	 */
	update(properties) {
		const propertyEntries = Object.entries(properties);

		for (let i = 0; i < propertyEntries.length; i++) {
			const elementId = propertyEntries[i][0];
			const value = propertyEntries[i][1];

			if (!(elementId in this.#container.children)) {
				const element = document.createElement("span");

				element.id = elementId;
				element.textContent = `${elementId}: ${value}`;

				this.#container.appendChild(element);

				continue;
			}

			const element = this.#container.children[elementId];

			element.textContent = `${elementId}: ${value}`;
		}
	}
}