import {BoxGeometry} from "../../../src/geometries/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {TextureMaterial} from "../../../src/materials/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND} from "../index.js";
import {Mesh} from "../Mesh.js";

export async function setup(renderer) {
	const {scene, camera} = renderer;

	scene.lights.push(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .75,
			position: new Vector3(64, 200, 64),
			direction: new Vector3(),
		}),
	);

	const position = new Vector3(50, ENTITY_HEIGHT_STAND, 0);

	renderer.player = new Mesh(
		new BoxGeometry(new Vector3(16, 16, 16)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			texture: renderer.textures["metal/metalcombine001.jpg"],
			normalMap: renderer.textures["metal/metalcombine001_normal.jpg"],
		}),
	);
	renderer.player.position = position.clone();
	renderer.player.buildHitBox();

	camera.distance = new Vector3(0, 0, 64);
	camera.position = position;
	camera.target = position;

	const meshes = await (await fetch("public/hl2/scenes/building_entrance.json")).json();

	for (let i = meshes.length - 1; i >= 0; i--) {
		if (meshes[i].label == null) continue;

		scene.meshes.push(Mesh.fromJSON(meshes[i], renderer.textures));
	}
}