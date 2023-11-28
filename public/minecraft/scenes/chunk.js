import {Mesh, Scene} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {DirectionalLight} from "../../../src/lights/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, NOISE_AMPLITUDE, NOISE_INC} from "../main.js";

/**
 * @returns {Scene}
 */
export function createScene() {
	const
		seed = .6389044591913386,
		chunkSize = 16,
		chunkSizeSquared = chunkSize ** 2,
		chunkCenter = chunkSize / 2 - .5,
		meshes = [];
	let mesh, i, j = 0, x, y, z;

	noise.seed(seed);

	for (i = 0; i < chunkSizeSquared; i++) {
		mesh = new Mesh(
			new BoxGeometry(new Vector3(1, 1, 1)),
			new Material({
				textureMatrix: new Matrix3(),
				textureIndex: 1,
				normalMapIndex: null,
			}),
		);

		if (i % chunkSize === 0) j++;

		x = i % chunkSize;
		z = j % chunkSize;
		y = Math.round(noise.perlin2(x * NOISE_INC, z * NOISE_INC) * NOISE_AMPLITUDE);

		mesh.setPosition(new Vector3(x, y, z).subtractScalar(chunkCenter).multiplyScalar(.85));
		mesh.scale = new Vector3(BLOCK_SCALE, BLOCK_SCALE, BLOCK_SCALE);

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