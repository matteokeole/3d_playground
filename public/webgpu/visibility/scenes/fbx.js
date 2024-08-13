import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Geometry} from "../../../../src/Geometry/index.js";
import {FBXBinaryLoader} from "../../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const fbxBinaryLoader = new FBXBinaryLoader();
	const fbxFile = await fbxBinaryLoader.load("assets/models/fbx/cube.bin.fbx");
	const vertices = fbxFile.Nodes[8].NestedList[0].NestedList[2].Properties[0].Data.Contents;
	const indices = fbxFile.Nodes[8].NestedList[0].NestedList[3].Properties[0].Data.Contents;
	const geometry = new Geometry({
		vertices: new Float32Array(vertices),
		// indices,
		indices: Uint32Array.of(0, 4, 6, 0, 6, 2, 3, 2, 6, 3, 6, 7, 7, 6, 4, 7, 4, 5, 5, 1, 3, 5, 3, 7, 1, 0, 2, 1, 2, 3, 5, 4, 0, 5, 0, 1),
		normals: new Float32Array(),
		tangents: new Float32Array(),
		uvs: new Float32Array(),
	});

	const mesh = new Mesh(geometry, null);
	mesh.setPosition(new Vector3(0, 0, 2));
	// mesh.setRotation(new Vector3(PI / 2, PI, PI));
	mesh.setScale(new Vector3().addScalar(1));
	mesh.updateProjection();

	const scene = new Scene();

	scene.addMeshes(geometry, [mesh]);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new PerspectiveCamera();

	camera.setPosition(new Vector3(0, 2, 0));
	camera.fieldOfView = 45;
	camera.aspectRatio = aspectRatio;
	camera.near = 0.1;
	camera.far = 100;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}