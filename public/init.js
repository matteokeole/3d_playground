import {TEXTURES} from "./constants.js";
import {Mesh} from "../src/Mesh.js";
import {BoxGeometry} from "../src/geometries/index.js";
import {Material} from "../src/materials/index.js";
import {Vector3} from "../src/math/index.js";

const geometry = new BoxGeometry(1, 1, 1);

export default function(scene, camera) {
	camera.target.y = 1.8;

	const meshes = testFov();

	scene.add(...meshes);
}

function testFov() {
	const
		meshes = [],
		material = {
			white: new Material({
				texture: TEXTURES["white.png"],
			}),
			black: new Material({
				texture: TEXTURES["black.png"],
			}),
			test: new Material({
				texture: TEXTURES["crafting_table_side.png"],
			}),
		},
		uvs = new Float32Array([
			0, 0,
			0, 1,
			1, 0,
			1, 1,
		]),
		scale = .85,
		scaleVector = new Vector3(1, 1, 1).multiplyScalar(scale);
	let mesh, i = 0;

	for (; i < 26; i++) {
		mesh = new Mesh(
			geometry,
			i % 2 === 0 ? material.white : material.black,
		);
		mesh.geometry.uvs = uvs;
		mesh.position = new Vector3(0, 0, i * scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 7; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.geometry.uvs = uvs;
		mesh.position = new Vector3(-1, 1, i * 4 + 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);

		mesh = new Mesh(geometry, material.test);
		mesh.geometry.uvs = uvs;
		mesh.position = new Vector3(-1, 2, i * 4 + 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.geometry.uvs = uvs;
		mesh.position = new Vector3(1, i + 1, 1).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	for (i = 0; i < 2; i++) {
		mesh = new Mesh(geometry, material.test);
		mesh.geometry.uvs = uvs;
		mesh.position = new Vector3(1, i + 1, 25).multiplyScalar(scale);
		mesh.scale = scaleVector;

		meshes.push(mesh);
	}

	return meshes;
}

// Windows Chrome: 165 FPS (stable) with 120k instanced meshes (JS for loop limit)
function testColumns() {
	const meshes = [];
	let i, j, k;
	i = j = k = 0;

	for (; i < 1000; i++) {
		const mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new Material({
				texture: TEXTURES["noodles.jpg"],
			}),
		);

		if (i % 10 === 0) j++;
		if (i % 100 === 0) k++;

		mesh.position = new Vector3(i % 10 - 4.5, -1 - k, j % 10 - 4.5);
		// mesh.position = new Vector3(0, -.8, 2);
		// mesh.rotation = new Vector3(0, -Math.PI / 7, 0);
		mesh.scale = new Vector3(.8, .8, .8);

		meshes.push(mesh);
	}

	return meshes;
}