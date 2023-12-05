import {Camera, Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, FIELD_OF_VIEW} from "../main.js";
import {Scene} from "../Scene.js";

/**
 * CURR/MAX FPS - 120K instanced meshes
 * Windows 10/Chrome: 165/165 FPS
 * Ubuntu/Firefox: 38/60 FPS
 * 
 * @returns {Scene}
 */
export function createScene() {
	const n = 300;
	const meshes = [];

	for (let i = 0, j = 0, k = 0; i < n; i++) {
		const mesh = new Mesh(
			new BoxGeometry(new Vector3(1, 1, 1)),
			new Material({
				textureMatrix: Matrix3.identity(),
				textureIndex: 1,
				normalMapIndex: null,
			}),
		);

		if (i % 10 === 0) j++;
		if (i % 100 === 0) k++;

		mesh.setPosition(new Vector3(i % 10 - 4.5, 1 - k, j % 10 - 4.5));
		mesh.scale = new Vector3().addScalar(BLOCK_SCALE);

		meshes.push(mesh);
	}

	const pointLight = new Camera();
	pointLight.setPosition(new Vector3(2.73, 1.80, 2.46));
	pointLight.target = pointLight.getPosition().clone();
	pointLight.setRotation(new Vector3(-0.24, -2.24, 0));
	pointLight.fieldOfView = FIELD_OF_VIEW;
	pointLight.aspectRatio = innerWidth / innerHeight;
	pointLight.near = 1;
	pointLight.far = 200;
	pointLight.bias = PI * .5;
	pointLight.turnVelocity = 0;
	pointLight.lookAt(new Vector2());

	const scene = new Scene(meshes);
	scene.setPointLight(pointLight);

	return scene;
}