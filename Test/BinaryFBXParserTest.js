import {BinaryLoader} from "../src/Loader/index.js";
import {FBXParser} from "../src/Parser/Binary/index.js";
import {Test} from "../src/Test/index.js";

export class BinaryFBXParserTest extends Test {
	/**
	 * Tests results:
	 * - cube.fbx (7.4): 71.5kB
	 * - sample.fbx (7.4): 55.9kB
	 * - table.fbx (7.4): 209kB
	 */
	async execute() {
		const url = "Test/Asset/FBX/Binary/cube.fbx";

		const binaryLoader = new BinaryLoader();
		const arrayBuffer = await binaryLoader.load(url);

		const fbxParser = new FBXParser();
		const fbxFile = fbxParser.parse(arrayBuffer);

		// const vertices = fbxFile.NodeList[8].NestedList[0].NestedList[2].Properties[0].Data.Contents;
		// const indices = fbxFile.NodeList[8].NestedList[0].NestedList[3].Properties[0].Data.Contents;
		const json = JSON.stringify(fbxFile, (_, a) => typeof a === "bigint" ? a.toString() : a);

		console.log(json);
	}
}