import {Camera, Scene} from "../../../../src/index.js";
import {GridGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";
import {CAMERA_HEIGHT, FIELD_OF_VIEW} from "../../../minecraft/main.js";

export async function createScene() {
	const meshes = [];

	const wavePlane = new Mesh(new GridGeometry({
		size: new Vector2(10, 10),
		step: 1,
	}), null);
	meshes.push(wavePlane);

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, CAMERA_HEIGHT, -5));
	camera.target.set(camera.getPosition());
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .01;
	camera.far = 100;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}