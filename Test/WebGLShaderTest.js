import {TextLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class WebGLShaderTest extends Test {
	async execute() {
		const textLoader = new TextLoader();
		const text = await textLoader.load("Test/Asset/Shader/SolidColorQuad.glsl");

		/**
		 * @todo
		 */
		// const shader = new WebGLShader(text, "SolidColorQuad");

		debugger;
	}
}