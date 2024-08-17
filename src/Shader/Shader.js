export class Shader {
	#name;

	/**
	 * @param {String} name
	 */
	constructor(name) {
		this.#name = name;
	}

	getName() {
		return this.#name;
	}
}