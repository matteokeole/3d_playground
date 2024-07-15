import {Camera, Scene} from "../../../src/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {SENSITIVITY} from "../../hl2/main.js";
import {CAMERA_HEIGHT, FIELD_OF_VIEW} from "../../minecraft/main.js";

const boxGeometry = new BoxGeometry(new Vector3(1, 1, 1));
const boxGeometryVertices = boxGeometry.getVertices();

for (let i = 0; i < boxGeometryVertices.length; i += 3) {
	boxGeometryVertices[i + 0] -= 6;
}

const tetrahedronGeometry = new PolytopeGeometry({
	vertices: Float32Array.of(
		0,  1,  0,
		1,  0, -1,
	   -1,  0, -1,
		0,  0,  1,
	),
	indices: Uint8Array.of(
		0, 1, 2,
		0, 2, 3,
		0, 3, 1,
		1, 2, 3,
	),
});

export async function createScene() {
	const meshes = [];

	const tetrahedron = new Mesh(tetrahedronGeometry, null);
	// tetrahedron.setPosition(new Vector3(0, 0, 5));
	// tetrahedron.updateProjection();
	meshes.push(tetrahedron);

	const box = new Mesh(boxGeometry, null);
	// tetrahedron.setPosition(new Vector3(0, 0, 5));
	// tetrahedron.updateProjection();
	meshes.push(box);

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, CAMERA_HEIGHT, -5));
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