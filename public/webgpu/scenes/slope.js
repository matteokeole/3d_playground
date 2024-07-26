import {Camera, Scene} from "../../../src/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../src/Geometry/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Material} from "../../../src/Material/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL} from "../../index.js";
import {SENSITIVITY} from "../../hl2/main.js";

export async function createScene() {
	const meshes = [];

	const box = new Mesh(new BoxGeometry(new Vector3(1, 1, 1)), null);
	box.setPosition(new Vector3(0, 0, 5));
	box.updateProjection();
	meshes.push(box);

	const slope = new Mesh(new PolytopeGeometry({
		vertices: Float32Array.of(
		   -2,  0,  0,
		   -2,  4,  4,
			2,  4,  4,
			2,  0,  0,
		),
		indices: Uint8Array.of(
			0, 1, 2,
			0, 2, 3,
		),
	}), null);
	slope.setPosition(new Vector3(0, 0, 0));
	slope.updateProjection();
	meshes.push(slope);

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 0, 0));
	camera.target = new Vector3(camera.getPosition());
	camera.setRotation(new Vector3(-.7, 0, 0));
	camera.setDistance(new Vector3(0, 0, -5));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .01;
	camera.far = 100;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}