import {Camera, Scene} from "../../../src/index.js";
import {PolytopeGeometry} from "../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {SENSITIVITY} from "../../hl2/main.js";
import {FIELD_OF_VIEW} from "../../index.js";

const polytopeGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		/* 0, 0, 0,
		1, 0, 0,
		0, -1, 0,
		2, -1, 0,
		3, 0, 0, */
		0, 0, 0,
		1, 0, 0,
		0, -1, 0,

		1, 0, 0,
		2, -1, 0,
		0, -1, 0,

		1, 0, 0,
		3, 0, 0,
		2, -1, 0,
	),
	indices: Uint8Array.of(
		/* 0, 1, 2,
		1, 3, 2,
		1, 4, 3, */
		0, 1, 2,
		3, 4, 5,
		6, 7, 8,
	),
});

export async function createScene() {
	const cluster = new Mesh(polytopeGeometry, null);
	cluster.setPosition(new Vector3(-1, .5, 2));
	cluster.updateProjection();

	const cluster2 = new Mesh(polytopeGeometry, null);
	cluster2.setPosition(new Vector3(1, 3, 5));
	cluster2.updateProjection();

	const scene = new Scene([cluster, cluster2]);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 0, 0));
	camera.target.set(camera.getPosition());
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .01;
	camera.far = 20;
	camera.bias = PI * .5;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}