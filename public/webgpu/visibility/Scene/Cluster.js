import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW} from "../../../index.js";

const squareGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		-1,  1,  0,
		 1,  1,  0,
		-1, -1,  0,
		 1, -1, 0,
	),
	indices: Uint32Array.of(
		0, 1, 2,
		1, 3, 2,
	),
});

const triangleGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		-0.5, -0.8,  0,
		 0,  0.2,  0,
		 0.5, -0.8,  0,
	),
	indices: Uint32Array.of(
		0, 1, 2,
	),
});

export async function createScene() {
	const square1 = new Mesh(squareGeometry, null);
	square1.setPosition(new Vector3(-2, 0, 0));
	square1.updateWorld();

	const square2 = new Mesh(squareGeometry, null);
	square2.setPosition(new Vector3(2, 0, 0));
	square2.updateWorld();

	const triangle = new Mesh(triangleGeometry, null);
	triangle.setPosition(new Vector3(0, 0, 0));
	triangle.updateWorld();

	const scene = new Scene();
	scene.addMeshes(squareGeometry, [square1, square2]);
	scene.addMeshes(triangleGeometry, [triangle]);

	return scene;
}

export function createCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(0, 0, -4),
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 1,
		farClipPlane: 1000,
	});

	return camera;
}