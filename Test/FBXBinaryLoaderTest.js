import {FBXBinaryLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class FBXBinaryLoaderTest extends Test {
	async execute() {
		const url = "Test/Asset/FBX/Binary/cube.fbx";
		const fbxBinaryLoader = new FBXBinaryLoader();
		const fbxFile = await fbxBinaryLoader.load(url);
		const vertices = fbxFile.Nodes[8].NestedList[0].NestedList[2].Properties[0].Data.Contents;
		const indices = fbxFile.Nodes[8].NestedList[0].NestedList[3].Properties[0].Data.Contents;

		console.log(fbxFile, vertices, indices);
	}
}