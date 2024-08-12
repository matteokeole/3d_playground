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
}