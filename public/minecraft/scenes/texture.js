import {AbstractCamera, Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, FIELD_OF_VIEW} from "../main.js";
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
	mesh.scale = new Vector3().addScalar(BLOCK_SCALE);

	const pointLight = new AbstractCamera();
	pointLight.setPosition(new Vector3(1.04, 2.90, 0.48));
	pointLight.target = pointLight.getPosition().clone();
	pointLight.rotation = new Vector3(-0.68, -0.68, 0);
	pointLight.fieldOfView = FIELD_OF_VIEW;
	pointLight.aspectRatio = innerWidth / innerHeight;
	pointLight.near = 1;
	pointLight.far = 200;
	pointLight.bias = PI * .5;
	pointLight.turnVelocity = 0;
	pointLight.lookAt(new Vector2());

	const scene = new Scene([mesh]);
	scene.setPointLight(pointLight);

	return scene;
}