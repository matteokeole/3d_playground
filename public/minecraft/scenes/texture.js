import {Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {DirectionalLight} from "../../../src/lights/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE} from "../main.js";
import {Scene} from "../Scene.js";

/**
 * @returns {Scene}
 */
export function createScene() {
	const mesh = new Mesh(
		new BoxGeometry(new Vector3(1, 1, 1)),
		new Material({
			textureMatrix: new Matrix3(),
			textureIndex: 0,
			normalMapIndex: null,
		}),
	);

	mesh.setPosition(new Vector3(0, 1.3, 2).multiplyScalar(.85));
	mesh.scale = new Vector3(1, 1, 1).multiplyScalar(BLOCK_SCALE);

	const scene = new Scene([mesh]);
	scene.setDirectionalLight(
		new DirectionalLight({
			color: new Vector3(1, 1, 1),
			intensity: 1,
			direction: new Vector3(-.8, -.2, .15),
		}),
	);

	return scene;
}