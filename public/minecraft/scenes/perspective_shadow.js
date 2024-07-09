import {Camera, Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, FIELD_OF_VIEW} from "../main.js";
import {Scene} from "../Scene.js";

const GEOMETRY = new BoxGeometry(new Vector3(1, 1, 1));
const MATERIAL = new Material({
	textureMatrix: new Matrix3(),
	textureIndex: 2,
	normalMapIndex: null,
});

/**
 * @returns {Scene}
 */
export function createScene() {
	const meshes = [];

	// Create 9x5 platform
	{
		const mesh = new Mesh(GEOMETRY, MATERIAL);
		mesh.getPosition()[2] = 3 * BLOCK_SCALE;
		mesh.scale = new Vector3(9, 1, 5).multiplyScalar(BLOCK_SCALE);

		meshes.push(mesh);
	}

	// Add test blocks
	{
		{
			const mesh = new Mesh(GEOMETRY, MATERIAL);
			mesh.setPosition(new Vector3(-1, 1, 3).multiplyScalar(BLOCK_SCALE));
			mesh.scale = new Vector3().addScalar(BLOCK_SCALE);

			meshes.push(mesh);
		}

		{
			const mesh = new Mesh(GEOMETRY, MATERIAL);
			mesh.setPosition(new Vector3(1, 1, 3).multiplyScalar(BLOCK_SCALE));
			mesh.scale = new Vector3().addScalar(BLOCK_SCALE);

			meshes.push(mesh);
		}
	}

	const pointLight = new Camera();
	pointLight.setPosition(new Vector3(-2.5, 1.8, 3.5));
	// pointLight.target = new Vector3(pointLight.getPosition());
	pointLight.setRotation(new Vector3(-0.17, PI / 2, 0));
	pointLight.fieldOfView = FIELD_OF_VIEW;
	pointLight.aspectRatio = 16 / 9;
	pointLight.near = 1;
	pointLight.far = 200;
	pointLight.bias = PI * .5;
	pointLight.turnVelocity = 0;
	pointLight.lookAt(new Vector2());

	const scene = new Scene(meshes);
	scene.setPointLight(pointLight);

	return scene;
}