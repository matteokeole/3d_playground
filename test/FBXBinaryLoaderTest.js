import {FBXBinaryLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class FBXBinaryLoaderTest extends Test {
	async execute() {
		const url = "assets/models/fbx/cube.bin.fbx";
		const fbxBinaryLoader = new FBXBinaryLoader();

		const file = await fbxBinaryLoader.load(url);
		const vertices = file.Nodes[8].NestedList[0].NestedList[2].Properties[0].Data.Contents;
		const indices = file.Nodes[8].NestedList[0].NestedList[3].Properties[0].Data.Contents;

		console.log(file, vertices, indices);
	}
}