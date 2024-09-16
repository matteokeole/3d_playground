import {BinaryLoader} from "../src/Loader/index.js";
import {FBXParser} from "../src/Parser/Binary/index.js";
import {UnitTest} from "../src/Test/index.js";

export class BinaryFBXParserTest extends UnitTest {
	/**
	 * Tests results:
	 * - cube.fbx (7.4): 71.5kB
	 * - sample.fbx (7.4): 55.9kB
	 * - table.fbx (7.4): 209kB
	 */
	async execute() {
		const url = "Test/Asset/Model/FBX/Binary/cube.fbx";

		const binaryLoader = new BinaryLoader();
		const arrayBuffer = await binaryLoader.load(url);

		const fbxParser = new FBXParser();
		const fbxData = await fbxParser.parse(arrayBuffer);

		debugger;
	}
}