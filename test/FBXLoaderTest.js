import {FBXLoader} from "../src/Loader/FBXLoader.js";
import {Test} from "../src/Test/index.js";

export class FBXLoaderTest extends Test {
	async execute() {
		const url = "assets/models/fbx/cube2.fbx";
		const fbxLoader = new FBXLoader();

		await fbxLoader.load(url);
	}
}