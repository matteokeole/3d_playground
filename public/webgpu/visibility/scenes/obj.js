import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Geometry} from "../../../../src/Geometry/index.js";
import {OBJLoader} from "../../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";
import {FIELD_OF_VIEW} from "../../../index.js";

export async function createScene() {
	const objLoader = new OBJLoader();
	const obj = await objLoader.load("assets/models/bunny.obj");
	const geometry = new Geometry({
		vertices: obj.vertices,
		indices: obj.indices,
		normals: Float32Array.of(),
		tangents: Float32Array.of(),
		uvs: Float32Array.of(),
	});

	const mesh = new Mesh(geometry, null);
	mesh.setPosition(new Vector3(0, 0, 5));
	mesh.setScale(new Vector3(30, 30, 30));
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

	camera.setPosition(new Vector3(0, 4, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = 1;
	camera.far = 1000;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}