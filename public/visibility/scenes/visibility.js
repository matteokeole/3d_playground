import {Camera, Mesh, Scene} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {SENSITIVITY} from "../../hl2/main.js";
import {ENTITY_HEIGHT_STAND, FIELD_OF_VIEW} from "../../minecraft/main.js";

const GEOMETRY = new BoxGeometry(new Vector3(1, 1, 1));
const SCALE = .85;

export async function createScene() {
	const meshes = [];

	// Create 9x5 platform
	{
		const mesh = new Mesh(GEOMETRY, null);
		mesh.setPosition(new Vector3(0, 0, 3).multiplyScalar(SCALE));
		mesh.setScale(new Vector3(9, 1, 5).multiplyScalar(SCALE));
		mesh.updateProjection();

		meshes.push(mesh);
	}

	// Test block 1
	{
		const mesh = new Mesh(GEOMETRY, null);
		mesh.setPosition(new Vector3(-1, 1, 3).multiplyScalar(SCALE));
		mesh.setScale(new Vector3().addScalar(SCALE));
		mesh.updateProjection();

		meshes.push(mesh);
	}

	// Test block 2
	{
		const mesh = new Mesh(GEOMETRY, null);
		mesh.setPosition(new Vector3(1, 1, 3).multiplyScalar(SCALE));
		mesh.setScale(new Vector3().addScalar(SCALE));
		mesh.updateProjection();

		meshes.push(mesh);
	}

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, ENTITY_HEIGHT_STAND, 0));
	camera.target = new Vector3(camera.getPosition());
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .01;
	camera.far = 100;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}