import {Camera, Scene} from "../../../src/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL} from "../../index.js";
import {SENSITIVITY} from "../../hl2/main.js";

export async function createScene() {
	const meshes = [];

	const slope = new Mesh(new PolytopeGeometry({
		vertices: Float32Array.of(
			0,  0,  0,
			0,  64, 64,
			64, 64, 64,
			64, 0,  0,
		),
		indices: Uint8Array.of(
			0, 1, 2,
			0, 2, 3,
		),
	}), null);
	slope.setPosition(new Vector3(0, 0, 0));
	slope.updateProjection();
	meshes.push(slope);

	const floor = new Mesh(new BoxGeometry(new Vector3(512, 16, 512)), null);
	floor.setPosition(new Vector3(0, 0, 0));
	floor.updateProjection();
	meshes.push(floor);

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 64, 0));
	camera.target = new Vector3(camera.getPosition());
	camera.setDistance(new Vector3(0, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .01;
	camera.far = 1000;
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	const hull = new Mesh(new BoxGeometry(PLAYER_COLLISION_HULL), null);
	hull.setPosition(new Vector3(0, 0, 0));
	hull.updateProjection();

	camera.setHull(hull);

	return camera;
}