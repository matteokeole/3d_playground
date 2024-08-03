import {Camera} from "../../../../src/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL, PLAYER_VIEWPOINT} from "../../../index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const planeGeometry = new BoxGeometry(new Vector3(256, 0, 256));
	const plane = new Mesh(planeGeometry, null);
	plane.setPosition(new Vector3(0, 0, 0));
	plane.updateProjection();

	const boxGeometry = new BoxGeometry(new Vector3(1, 1, 1));
	const leftBox = new Mesh(boxGeometry, null);
	leftBox.setPosition(new Vector3(-112, 24, 32));
	leftBox.setScale(new Vector3(32, 48, 192));
	leftBox.updateProjection();

	const bridge = new Mesh(boxGeometry, null);
	bridge.setPosition(new Vector3(-64, 42, 96));
	bridge.setScale(new Vector3(64, 12, 64));
	bridge.updateProjection();

	const centerBox = new Mesh(boxGeometry, null);
	centerBox.setPosition(new Vector3(16, 24, 96));
	centerBox.setScale(new Vector3(96, 48, 64));
	centerBox.updateProjection();

	const rightBox = new Mesh(boxGeometry, null);
	rightBox.setPosition(new Vector3(96, 24, 64));
	rightBox.setScale(new Vector3(64, 48, 128));
	rightBox.updateProjection();

	const slopeGeometry = new PolytopeGeometry({
		vertices: Float32Array.of(
			// Slope
		   -0.5,   0.5,   0.5,
			0.5,   0.5,   0.5,
		   -0.5,  -0.5,  -0.8,
			0.5,  -0.5,  -0.8,

			// Back
		   -0.5,  -0.5,   0.5,
			0.5,  -0.5,   0.5,
		),
		indices: Uint32Array.of(
			0, 1, 2,
			1, 3, 2,
			0, 2, 4,
			1, 5, 3,
			1, 0, 5,
			0, 4, 5,
			2, 3, 4,
			3, 5, 4,
		),
	});
	const slope = new Mesh(slopeGeometry, null);
	slope.setPosition(new Vector3(96, 24, -24));
	slope.setScale(new Vector3(64, 48, 48));
	slope.updateProjection();

	const scene = new Scene();
	scene.addMeshes(planeGeometry, [plane]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(boxGeometry, [leftBox, bridge, centerBox, rightBox]);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 64, -64));
	camera.target.set(camera.getPosition());
	camera.setDistance(new Vector3(0, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = 1;
	camera.far = 1000;
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	const hull = new Mesh(new BoxGeometry(PLAYER_COLLISION_HULL), null);
	hull.setPosition(new Vector3(0, 40, 0));
	hull.updateProjection();

	camera.setHull(hull);
	camera.setViewpoint(PLAYER_VIEWPOINT);

	return camera;
}