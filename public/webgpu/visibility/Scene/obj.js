import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Geometry} from "../../../../src/Geometry/index.js";
import {FileLoader} from "../../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {OBJParser} from "../../../../src/Parser/Text/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

/**
 * Unusable OBJ:
 * - assets/models/CornellBox/CornellBox-Empty-CO.obj
 * - assets/models/CornellBox/CornellBox-Empty-RG.obj
 * - assets/models/CornellBox/CornellBox-Empty-Squashed.obj
 * - assets/models/CornellBox/CornellBox-Empty-White.obj
 * - assets/models/CornellBox/CornellBox-Glossy-Floor.obj
 * - assets/models/CornellBox/CornellBox-Glossy.obj
 * - assets/models/CornellBox/CornellBox-Mirror.obj
 * - assets/models/CornellBox/CornellBox-Original.obj
 */
export async function createScene() {
	const fileLoader = new FileLoader();
	const response = await fileLoader.load("assets/models/bunny_high.obj");
	const text = await response.text();

	const objParser = new OBJParser();
	const obj = objParser.parse(text);

	const geometry = new Geometry({
		vertices: obj.vertices,
		indices: obj.indices,
		normals: Float32Array.of(),
		tangents: Float32Array.of(),
		uvs: Float32Array.of(),
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