import {FBXBinaryLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class FBXBinaryLoaderTest extends Test {
	async execute() {
		const url = "assets/models/fbx/cube.bin.fbx";
		const fbxBinaryLoader = new FBXBinaryLoader();

		const file = await fbxBinaryLoader.load(url);

		console.log(file);
	}
}