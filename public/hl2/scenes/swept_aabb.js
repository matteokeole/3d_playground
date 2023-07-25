import {BoxGeometry} from "src/geometries";
import {PointLight} from "src/lights";
import {TextureMaterial} from "src/materials";
import {Matrix3, Vector3} from "src/math";
import {Mesh} from "../Mesh.js";

export async function setup(renderer) {
	const {scene, camera} = renderer;

	scene.lights.push(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .5,
			position: new Vector3(0, 64, 128),
			direction: new Vector3(),
		}),
	);

	const position = new Vector3(0, 8, 0);

	camera.position = position;
	camera.target = position;
	camera.rotation = new Vector3(-Math.PI / 6, 0, 0);
	camera.distance = new Vector3(0, 0, -64);

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

	renderer.wall = new Mesh(
		new BoxGeometry(new Vector3(64, 64, 0)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			texture: renderer.textures["plaster/plasterwall030c.jpg"],
			normalMap: renderer.textures["plaster/plasterwall030c_normal.jpg"],
		}),
	);
	renderer.wall.position = new Vector3(0, 32, 64);
	renderer.wall.buildHitBox();

	scene.add(renderer.player, renderer.wall);

	const meshes = await (await fetch("public/hl2/scenes/swept_aabb.json")).json();

	for (let i = meshes.length - 1, json; i >= 0; i--) {
		if (meshes[i].label == null) continue;

		scene.add(Mesh.fromJSON(meshes[i], renderer.textures));
	}
}