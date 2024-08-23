import {createRendererFromRandomApi} from "../src/Renderer/index.js";
import {Test} from "../src/Test/index.js";

export class LoadShaderTest extends Test {
	async execute() {
		const canvas = this.createTestCanvas();
		const renderer = createRendererFromRandomApi(canvas);

		await renderer.build();

		/**
		 * @todo Load shader
		 */

		debugger;
	}
}