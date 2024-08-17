import {Layer} from "../src/Layer/index.js";

export class ExampleLayer extends Layer {
	constructor() {
		super("Example");

		/**
		 * @todo Create instance here
		 */
	}

	/**
	 * @type {Layer["update"]}
	 */
	update(deltaTime) {
		console.log(deltaTime);
	}
}