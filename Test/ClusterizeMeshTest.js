import {Clusterizer} from "../src/Clusterizer.js";
import {PolytopeGeometry} from "../src/Geometry/PolytopeGeometry.js";
import {TextLoader} from "../src/Loader/index.js";
import {OBJParser} from "../src/Parser/Text/OBJParser.js";
import {UnitTest} from "../src/Test/index.js";

export class ClusterizeMeshTest extends UnitTest {
	async execute() {
		const url = "Test/Asset/Model/OBJ/Bunny.obj";

		const textLoader = new TextLoader();
		const text = await textLoader.load(url);

		const objParser = new OBJParser();
		const objData = objParser.parse(text);

		const geometry = new PolytopeGeometry({
			indices: objData.indices,
			vertices: objData.vertices,
		});

		const clusteredGeometry = Clusterizer.clusterize(geometry);

		debugger;
	}
}