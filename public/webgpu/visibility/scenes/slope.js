import {Camera, Scene} from "../../../../src/index.js";
import {BoxGeometry, GridGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL, PLAYER_VIEWPOINT, SIGHT_RANGE} from "../../../index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const meshes = [];

	const floor = new Mesh(
		new BoxGeometry(new Vector3(256, 0, 256)),
		null,
	);
	floor.setPosition(new Vector3(0, 0, 0));
	floor.updateProjection();
	meshes.push(floor);

	const slope = new Mesh(new PolytopeGeometry({
		vertices: Float32Array.of(
			-32,  0,  0,
			-32,  64, 64,
			32, 64, 64,
			32, 0,  0,
		),
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
	}), null);
	slope.setPosition(new Vector3(0, 1, 0));
	slope.updateProjection();
	meshes.push(slope);

	const scene = new Scene(meshes);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, PLAYER_VIEWPOINT, -128));
	camera.target.set(camera.getPosition());
	camera.setDistance(new Vector3(0, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = SIGHT_RANGE[0];
	camera.far = SIGHT_RANGE[1];
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	const hull = new Mesh(new BoxGeometry(PLAYER_COLLISION_HULL), null);
	hull.setPosition(new Vector3(0, 0, 0));
	hull.updateProjection();

	camera.setHull(hull);

	return camera;
}