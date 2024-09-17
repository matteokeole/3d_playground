import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW} from "../../../index.js";

const polytopeGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		0, 0, 0,
		1, 0, 0,
		0, -1, 0,
		2, -1, 0,
		3, 0, 0,
	),
	indices: Uint32Array.of(
		0, 1, 2,
		1, 3, 2,
		1, 4, 3,
	),
});

export async function createScene() {
	const cluster = new Mesh(polytopeGeometry, null);
	cluster.setPosition(new Vector3(-1, .5, 3));
	cluster.updateProjection();

	const cluster2 = new Mesh(polytopeGeometry, null);
	cluster2.setPosition(new Vector3(1, 3, 5));
	cluster2.updateProjection();

	const scene = new Scene();

	scene.addMeshes(polytopeGeometry, [cluster, cluster2]);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new PerspectiveCamera({
		position: new Vector3(0, 0, 0),
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 1,
		farClipPlane: 1000,
	});

	camera.setAspectRatio(aspectRatio);

	return camera;
}