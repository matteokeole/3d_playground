import {TextLoader} from "../src/Loader/index.js";
import {WebGLRenderer} from "../src/Renderer/index.js";
import {WebGLShader} from "../src/Shader/WebGLShader.js";
import {WebGLShaderMap} from "../src/Shader/WebGLShaderMap.js";
import {Test} from "../src/Test/index.js";

export class WebGLShaderTest extends Test {
	async execute() {
		const textLoader = new TextLoader();
		const text = await textLoader.load("Test/Asset/Shader/WebGL/SolidColorQuad.glsl");

		const canvas = this.createTestCanvas();
		const renderer = new WebGLRenderer(canvas);

		await renderer.build();

		const shader = new WebGLShader(renderer._context, text, "SolidColorQuad");
		const shaderMap = new WebGLShaderMap(renderer._context, [
			shader,
		]);

		shaderMap.compile();

		debugger;
	}
}