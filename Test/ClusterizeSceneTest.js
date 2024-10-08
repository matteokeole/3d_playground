import {Clusterizer} from "../src/Clusterizer.js";
import {PolytopeGeometry} from "../src/Geometry/index.js";
import {TextLoader} from "../src/Loader/index.js";
import {StaticMesh} from "../src/Mesh/index.js";
import {OBJParser} from "../src/Parser/Text/index.js";
import {Scene} from "../src/Scene/index.js";
import {UnitTest} from "../src/Test/index.js";

export class ClusterizeSceneTest extends UnitTest {
	static #URL = "Test/Asset/Model/OBJ/Bunny1.obj";

	async execute() {
		const textLoader = new TextLoader();
		const text = await textLoader.load(ClusterizeSceneTest.#URL);

		const objParser = new OBJParser();
		const objData = objParser.parse(text);

		const geometry = new PolytopeGeometry({
			positions: objData.vertices,
			positionIndices: objData.vertexIndices,
			normals: Float32Array.of(),
			normalIndices: Uint32Array.of(),
		});

		const mesh = new StaticMesh({
			solid: false,
			geometry: geometry,
			material: null,
		});

		const scene = new Scene();

		scene.addMeshes(geometry, [mesh]);

		const clusteredMeshes = Clusterizer.parse(scene);

		debugger;
	}
}