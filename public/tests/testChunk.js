import {NOISE_AMPLITUDE, NOISE_INC, SCALE, TEXTURES} from "../constants.js";
import {Vector3} from "../../src/math/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Mesh} from "../../src/Mesh.js";

export default function() {
	const
		meshes = [],
		seed = .6389044591913386,
		chunkSize = 16,
		chunkSizeSquared = chunkSize ** 2,
		chunkCenter = chunkSize / 2 - .5;
	let mesh, i, j = 0, x, y, z;

	noise.seed(seed);

	for (i = 0; i < chunkSizeSquared; i++) {
		mesh = createMesh();

		if (i % chunkSize === 0) j++;

		x = i % chunkSize;
		z = j % chunkSize;
		y = Math.round(noise.perlin2(x * NOISE_INC, z * NOISE_INC) * NOISE_AMPLITUDE);

		mesh.position = new Vector3(x, y, z).substractScalar(chunkCenter).multiplyScalar(SCALE);
		mesh.scale = new Vector3(1, 1, 1).multiplyScalar(SCALE);

		meshes.push(mesh);
	}

	return meshes;
}

const createMesh = () => new Mesh(
	new BoxGeometry(new Vector3(1, 1, 1)),
	new Material({texture: TEXTURES["block/sculk.png"]}),
);