import {createRendererFromRandomApi, WebGLRenderer} from "../src/Renderer/index.js";
import {Test} from "../src/Test/index.js";

export class LoadShaderTest extends Test {
	async execute() {
		const canvas = this.createTestCanvas();
		const renderer = new WebGLRenderer(canvas);

		await renderer.build();

		await renderer.loadShader("SolidColorQuad", "Test/Asset/Shader/WebGL/SolidColorQuad.glsl");

		const solidColorQuadShader = renderer.getShader("SolidColorQuad");

		debugger;
	}
}