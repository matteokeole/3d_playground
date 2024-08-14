import {FBXBinaryLoader} from "../src/Loader/index.js";
import {Test} from "../src/Test/index.js";

export class FBXBinaryLoaderTest extends Test {
	/**
	 * Tests results:
	 * - cube.fbx (7.4): 71.5kB
	 * - sample.fbx (7.4): 55.9kB
	 * - table.fbx (7.4): 209kB
	 */
	async execute() {
		const url = "Test/Asset/FBX/Binary/cube.fbx";
		const fbxBinaryLoader = new FBXBinaryLoader();
		const fbxFile = await fbxBinaryLoader.load(url);
		// const vertices = fbxFile.NodeList[8].NestedList[0].NestedList[2].Properties[0].Data.Contents;
		// const indices = fbxFile.NodeList[8].NestedList[0].NestedList[3].Properties[0].Data.Contents;
		const json = JSON.stringify(fbxFile, (_, a) => typeof a === "bigint" ? a.toString() : a);

		console.log(json);
	}
}