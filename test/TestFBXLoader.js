import {FBXLoader} from "../src/Loader/FBXLoader.js";
import {Test} from "../src/Test/index.js";

export class TestFBXLoader extends Test {
	async execute() {
		const url = "assets/models/fbx/sample.fbx";
		const fbxLoader = new FBXLoader();
		const fbx = await fbxLoader.load(url);
	}
}