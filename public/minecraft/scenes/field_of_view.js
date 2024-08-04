import {Camera} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {TextureMaterial} from "../../../src/Material/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {BLOCK_SCALE, FIELD_OF_VIEW} from "../main.js";
import {Scene} from "../Scene.js";

/**
 * @returns {Scene}
 */
export function createScene() {
	const
		geometry = new BoxGeometry(new Vector3(1, 1, 1)),
		material = new TextureMaterial({
			textureMatrix: new Matrix3(),
			textureIndex: 2,
			normalMapIndex: null,
		}),
		scale = .85,
		scaleVector = new Vector3().addScalar(BLOCK_SCALE),
		meshes = [];
	let mesh, i;

	for (i = 0; i < 26; i++) {
		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(0, 0, i * scale));
		mesh.setScale(scaleVector);

		meshes.push(mesh);
	}

	for (i = 0; i < 7; i++) {
		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(-1, 1, i * 4 + 1).multiplyScalar(scale));
		mesh.setScale(scaleVector);

		meshes.push(mesh);

		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(-1, 2, i * 4 + 1).multiplyScalar(scale));
		mesh.setScale(scaleVector);

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(1, i + 1, 1).multiplyScalar(scale));
		mesh.setScale(scaleVector);

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material);
		mesh.setPosition(new Vector3(1, i + 1, 25).multiplyScalar(scale));
		mesh.setScale(scaleVector);

		meshes.push(mesh);
	}

	const pointLight = new Camera();
	pointLight.setPosition(new Vector3(-1.88, 4.71, -0.63));
	pointLight.setRotation(new Vector3(-0.64, 0.65, 0));
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