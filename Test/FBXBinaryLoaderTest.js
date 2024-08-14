import {FBXBinaryLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class FBXBinaryLoaderTest extends Test {
	async execute() {
		const url = "Test/Asset/FBX/Binary/cube.fbx";
		const fbxBinaryLoader = new FBXBinaryLoader();
		const file = await fbxBinaryLoader.load(url);

		console.log(file);
	}
}