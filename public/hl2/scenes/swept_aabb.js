import {Renderer} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {TextureMaterial} from "../../../src/materials/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../Mesh.js";

/**
 * @param {Renderer} renderer
 * @param {import("../../../src/Loader/TextureLoader.js").TextureDescriptor[]} textureDescriptors
 */
export async function setup(renderer, textureDescriptors) {
	const {scene, camera} = renderer;

	scene.lights.push(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .5,
			position: new Vector3(0, 64, -128),
			direction: new Vector3(),
		}),
	);

	const position = new Vector3(0, 8, 0);

	camera.position = position.clone();
	camera.target = position.clone();
	camera.rotation = new Vector3(-Math.PI / 6, 0, 0);
	camera.setDistance(new Vector3(0, 0, -64));

	const meshes = await (await fetch("public/hl2/scenes/swept_aabb.json")).json();

	for (let i = 0, length = meshes.length; i < length; i++) {
		if (meshes[i].label == null) {
			continue;
		}

		scene.meshes.push(Mesh.fromJSON(meshes[i], textureDescriptors, renderer._textures));
	}

	renderer.player = new Mesh(
		new BoxGeometry(new Vector3(16, 16, 16)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			texture: renderer._textures["metal/metalcombine001.jpg"],
			normalMap: renderer._textures["metal/metalcombine001_normal.jpg"],
		}),
	);
	renderer.player.setPosition(position.clone());
	renderer.player.buildHitbox();

	renderer.wall = new Mesh(
		new BoxGeometry(new Vector3(64, 64, 0)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			texture: renderer._textures["plaster/plasterwall030c.jpg"],
			normalMap: renderer._textures["plaster/plasterwall030c_normal.jpg"],
		}),
	);
	renderer.wall.setPosition(new Vector3(0, 32, 64));
	renderer.wall.buildHitbox();

	scene.meshes.push(renderer.player, renderer.wall);
}