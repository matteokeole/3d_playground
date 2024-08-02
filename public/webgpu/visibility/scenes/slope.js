import {Camera} from "../../../../src/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL, PLAYER_VIEWPOINT, SIGHT_RANGE} from "../../../index.js";
import {SENSITIVITY} from "../../../hl2/main.js";

export async function createScene() {
	const meshes = [];

	const planeGeometry = new BoxGeometry(new Vector3(256, 0, 256));
	const plane = new Mesh(planeGeometry, null);
	plane.setPosition(new Vector3(0, 0, 0));
	plane.updateProjection();
	meshes.push(plane);

	const leftBox = new Mesh(
		new BoxGeometry(new Vector3(32, 48, 192)),
		null,
	);
	leftBox.setPosition(new Vector3(-256, 0, 0));
	leftBox.updateProjection();
	meshes.push(leftBox);

	const bridge = new Mesh(
		new BoxGeometry(new Vector3(64, 12, 64)),
		null,
	);
	bridge.setPosition(new Vector3(0, 0, 0));
	bridge.updateProjection();
	// meshes.push(bridge);

	const centerBox = new Mesh(
		new BoxGeometry(new Vector3(92, 48, 64)),
		null,
	);
	centerBox.setPosition(new Vector3(0, 0, 0));
	centerBox.updateProjection();
	// meshes.push(centerBox);

	/* const rightBox = new Mesh(
		new BoxGeometry(new Vector3(32, 48, 64)),
		null,
	); */

	const mesh = new Mesh(
		new PolytopeGeometry({
			vertices: Float32Array.of(
				// Left front
				-128, 48, -64,
				-96, 48, -64,
				-128, 0, -64,
				-96, 0, -64,

				// Left right
				-96, 48, 64,
				-96, 0, 64,

				-96, 36, 64,
				-96, 36, 128,
				-96, 0, 64,
				-96, 0, 128,

				-32, 36, 128,
				-32, 36, 64,
				-32, 0, 128,
				-32, 0, 64,
			),
			indices: Uint32Array.of(
				0, 1, 2,
				1, 3, 2,

				1, 4, 3,
				4, 5, 3,

				6, 7, 8,
				7, 9, 8,

				10, 11, 12,
				// 11, 13, 12,
			),
		}),
		null,
	);
	mesh.setPosition(new Vector3(0, 0, 0));
	mesh.updateProjection();
	// meshes.push(mesh);

	const slope = new Mesh(
		new PolytopeGeometry({
			vertices: Float32Array.of(
			   -32,  0,   0,
			   -32,  64,  64,
				32,  64,  64,
				32,  0,   0,
			),
			indices: Uint32Array.of(
				0, 1, 2,
				0, 2, 3,
			),
		}),
		null,
	);
	slope.setPosition(new Vector3(0, 0, 0));
	slope.updateProjection();
	// meshes.push(slope);

	const scene = new Scene();
	scene.addMeshes(planeGeometry, [plane]);
	// scene.add(boxGeometry);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 40, -256));
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
	hull.setPosition(new Vector3(0, 40, 0));
	hull.updateProjection();

	camera.setHull(hull);
	camera.setViewpoint(PLAYER_VIEWPOINT);

	return camera;
}