import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {Geometry} from "../../../../src/Geometry/index.js";
import {OBJLoader} from "../../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const objLoader = new OBJLoader();
	const obj = await objLoader.load("assets/models/living_room/living_room.obj");
	const geometry = new Geometry({
		vertices: obj.vertices,
		indices: obj.indices,
		normals: Float32Array.of(),
		tangents: Float32Array.of(),
		uvs: Float32Array.of(),
	});

	const mesh = new Mesh(geometry, null);
	mesh.setPosition(new Vector3(0, 0, -3));
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