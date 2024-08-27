import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const floorGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			552.8, 0, 0,
			0,     0, 0,
			0,     0, 559.2,
			549.6, 0, 559.2,
		),
	});

	const floor = new Mesh(floorGeometry, null);
	floor.updateProjection();

	const scene = new Scene();

	scene.addMeshes(floorGeometry, [floor]);

	return scene;
}

export function createCamera() {
	const camera = new PerspectiveCamera();

	camera.setPosition(new Vector3(278, 273, -800));
	camera.fieldOfView = 0.035;
	camera.aspectRatio = 1;
	camera.near = 0.01;
	camera.far = 2000;
	camera.turnVelocity = SENSITIVITY;

	return camera;
}