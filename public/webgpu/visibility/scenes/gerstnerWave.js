import {Camera, Scene} from "../../../../src/index.js";
import {GridGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";
import {FIELD_OF_VIEW} from "../../../index.js";

export async function createScene() {
	const meshes = [];

	const wavePlane = new Mesh(
		new GridGeometry({
			size: new Vector2(24, 24),
			step: 1,
		}),
		null,
	);
	meshes.push(wavePlane);

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 20, 0));
	camera.getRotation().set(new Vector3(-PI / 2, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = 1;
	camera.far = 1000;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}