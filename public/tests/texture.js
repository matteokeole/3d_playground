import {Mesh} from "src";
import {BoxGeometry} from "src/geometries";
import {DirectionalLight} from "src/lights";
import {TextureMaterial} from "src/materials";
import {Vector3} from "src/math";
import {BLOCK_SCALE, ENTITY_HEIGHT_STAND} from "../main.js";

export function setup(renderer) {
	const {scene, camera, textures} = renderer;

	camera.position[1] = ENTITY_HEIGHT_STAND;
	camera.target[1] = ENTITY_HEIGHT_STAND;

	scene.directionalLight = new DirectionalLight({
		color: new Vector3(1, 1, 1),
		intensity: 1,
		direction: new Vector3(-.8, -.2, .15),
	});

	const mesh = new Mesh(
		new BoxGeometry(new Vector3(1, 1, 1)),
		new TextureMaterial({texture: textures["block/crafting_table_top.png"]}),
	);

	mesh.position = new Vector3(0, 1.3, 2).multiplyScalar(.85);
	mesh.scale = new Vector3(1, 1, 1).multiplyScalar(BLOCK_SCALE);

	scene.meshes = [mesh];
}