/**
 * @abstract
 */
export class Test {
	/**
	 * @abstract
	 */
	async execute() {
		throw new Error("Not implemented");
	}

	createTestCanvas() {
		const canvas = document.createElement("canvas");

		document.body.appendChild(canvas);

		return canvas;
	}
}