import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW} from "../../../index.js";

const polytopeGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		-1, -1,  5,
		 1, -1,  5,
		 0,  1,  5,
	),
	indices: Uint32Array.of(
		0, 1, 2,
	),
});

export async function createScene() {
	const cluster1 = new Mesh(polytopeGeometry, null);
	cluster1.setPosition(new Vector3(-1.5, -0.5, -1));
	cluster1.updateProjection();

	const cluster2 = new Mesh(polytopeGeometry, null);
	cluster2.setPosition(new Vector3(1.5, 0.5, 1));
	cluster2.updateProjection();

	const scene = new Scene();

	scene.addMeshes(polytopeGeometry, [cluster1, cluster2]);

	return scene;
}

export function createCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(0, 0, 0),
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 1,
		farClipPlane: 1000,
	});

	return camera;
}