import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {TextureMaterial} from "../../../src/Material/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {BLOCK_SCALE, FIELD_OF_VIEW, NOISE_AMPLITUDE, NOISE_INC} from "../main.js";
import {Scene} from "../Scene.js";

/**
 * @returns {Scene}
 */
export function createScene() {
	const
		chunkSize = 16,
		chunkSizeSquared = chunkSize ** 2,
		chunkCenter = chunkSize / 2 - .5,
		heightOffset = 9,
		meshes = [];
	let mesh, i, j = 0, x, y, z;

	for (i = 0; i < chunkSizeSquared; i++) {
		mesh = new Mesh(
			new BoxGeometry(new Vector3(1, 1, 1)),
			new TextureMaterial({
				textureMatrix: new Matrix3(),
				textureIndex: 1,
				normalMapIndex: null,
			}),
		);

		if (i % chunkSize === 0) j++;

		x = i % chunkSize + .5;
		z = j % chunkSize + .5;
		y = Math.round(noise.perlin2(x * NOISE_INC, z * NOISE_INC) * NOISE_AMPLITUDE) + heightOffset;

		mesh.setPosition(new Vector3(x, y, z).subtractScalar(chunkCenter).multiplyScalar(BLOCK_SCALE));
		mesh.getScale().multiplyScalar(BLOCK_SCALE);

		meshes.push(mesh);
	}

	const pointLight = new PerspectiveCamera();
	pointLight.setPosition(new Vector3(-4.82, 6.09, 3.54));
	pointLight.setRotation(new Vector3(-0.96, 2.17, 0));
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