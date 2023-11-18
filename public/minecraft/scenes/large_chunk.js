import {Mesh} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {DirectionalLight} from "../../../src/lights/index.js";
import {TextureMaterial} from "../../../src/materials/index.js";
import {Vector3} from "../../../src/math/index.js";
import {BLOCK_SCALE, ENTITY_HEIGHT_STAND, NOISE_AMPLITUDE, NOISE_INC} from "../main.js";

export function setup(renderer) {
	const {scene, camera} = renderer;

	camera.getPosition()[1] = ENTITY_HEIGHT_STAND;
	camera.target[1] = ENTITY_HEIGHT_STAND;

	scene.lights.push(
		new DirectionalLight({
			color: new Vector3(1, 1, 1),
			intensity: 1,
			direction: new Vector3(-.8, -.2, .15),
		}),
	);

	const
		seed = .6389044591913386,
		chunkSize = 340,
		chunkSizeSquared = chunkSize ** 2,
		chunkCenter = chunkSize / 2 - .5,
		yOffset = 140;
	let mesh, i, j = 0, x, y, z;

	noise.seed(seed);

	for (i = 0; i < chunkSizeSquared; i++) {
		mesh = createMesh(renderer._textures);

		if (i % chunkSize === 0) j++;

		x = i % chunkSize;
		z = j % chunkSize;
		y = Math.round(noise.perlin2(x * NOISE_INC, z * NOISE_INC) * NOISE_AMPLITUDE) + yOffset;

		mesh.setPosition(new Vector3(x, y, z).subtractScalar(chunkCenter).multiplyScalar(.85));
		mesh.scale = new Vector3(BLOCK_SCALE, BLOCK_SCALE, BLOCK_SCALE);

		scene.meshes.push(mesh);
	}
}

const createMesh = textures => new Mesh(
	new BoxGeometry(new Vector3(1, 1, 1)),
	new TextureMaterial({texture: textures["block/sculk.png"]}),
);