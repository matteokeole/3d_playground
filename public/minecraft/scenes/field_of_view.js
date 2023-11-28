import {Mesh, Scene} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {DirectionalLight} from "../../../src/lights/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE} from "../main.js";

/**
 * @returns {Scene}
 */
export function createScene() {
	const
		geometry = new BoxGeometry(new Vector3(1, 1, 1)),
		material = new Material({
			textureMatrix: new Matrix3(),
			textureIndex: 2,
			normalMapIndex: null,
		}),
		scale = .85,
		scaleVector = new Vector3(BLOCK_SCALE, BLOCK_SCALE, BLOCK_SCALE),
		meshes = [];
	let mesh, i;

	for (i = 0; i < 26; i++) {
		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(0, 0, i * scale));
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 7; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.setPosition(new Vector3(-1, 1, i * 4 + 1).multiplyScalar(scale));
		mesh.scale = scaleVector;

		meshes.push(mesh);

		mesh = new Mesh(geometry, material.test);
		mesh.setPosition(new Vector3(-1, 2, i * 4 + 1).multiplyScalar(scale));
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.setPosition(new Vector3(1, i + 1, 1).multiplyScalar(scale));
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.setPosition(new Vector3(1, i + 1, 25).multiplyScalar(scale));
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	const scene = new Scene(meshes);
	scene.lights = [
		new DirectionalLight({
			color: new Vector3(1, 1, 1),
			intensity: 1,
			direction: new Vector3(-.8, -.2, .15),
		}),
	];

	return scene;
}