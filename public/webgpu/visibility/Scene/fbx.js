import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {BinaryLoader} from "../../../../src/Loader/index.js";
import {FBXParser} from "../../../../src/Parser/Binary/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const binaryLoader = new BinaryLoader();
	const binary = await binaryLoader.load("Test/Asset/Model/FBX/Binary/sample.fbx");

	const fbxParser = new FBXParser();
	const fbxData = await fbxParser.parse(binary);

	const vertices = fbxData.NodeList[8].NestedList[0].NestedList[2].PropertyList[0].Data.Contents;
	const indices = fbxData.NodeList[8].NestedList[0].NestedList[3].PropertyList[0].Data.Contents;

	const triangleIndexing = indices.length / 3 && indices[2] < 0;
	let triangleIndices;

	if (triangleIndexing) {
		triangleIndices = new Uint32Array(indices.length);

		// Triangle indexing
		for (let i = 0; i < indices.length; i++) {
			let index = indices[i];

			if (index < 0) {
				index = -index - 1;
			}

			triangleIndices[i] = index;
		}
	} else {
		// Square indexing
		triangleIndices = new Uint32Array(indices.length * 2);

		for (let i = 0, j = 0; i < indices.length; i += 4, j += 6) {
			triangleIndices[j + 0] = indices[i + 0];
			triangleIndices[j + 1] = indices[i + 1];
			triangleIndices[j + 2] = indices[i + 2];
	
			triangleIndices[j + 3] = indices[i + 0];
			triangleIndices[j + 4] = indices[i + 2];
			triangleIndices[j + 5] = -indices[i + 3] - 1;
		}
	}

	const geometry = new PolytopeGeometry({
		vertices,
		indices: triangleIndices,
	});
	const mesh = new Mesh(geometry, null);

	mesh.setPosition(new Vector3(0, 0, 2));
	mesh.setRotation(new Vector3(-PI / 2, 0, PI / 2));
	mesh.setScale(new Vector3().addScalar(1));
	mesh.updateWorld();

	const scene = new Scene();

	scene.addMeshes(geometry, [mesh]);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new PerspectiveCamera();

	camera.setPosition(new Vector3(0, 0, 0));
	camera.fieldOfView = 45;
	camera.aspectRatio = aspectRatio;
	camera.near = 0.1;
	camera.far = 100;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}