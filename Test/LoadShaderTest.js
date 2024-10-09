import {UnitTest} from "../src/Test/index.js";

export class LoadShaderTest extends UnitTest {
	async execute() {
		const canvas = this.createTestCanvas();
		const renderer = this.createRendererFromApi(canvas, "webgpu");

		await renderer.build();

		await renderer.loadShader(
			"SSDPrototype",
			"Test/Asset/Shader/WebGPU/SSDPrototype.wgsl",
			"Test/Asset/Shader/WebGPU/SSDPrototype.vert.wgsl",
			"Test/Asset/Shader/WebGPU/SSDPrototype.frag.wgsl",
		);

		const shader = renderer.getShader("SSDPrototype");

		debugger;
	}
}