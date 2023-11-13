import {Renderer} from "../../../src/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND} from "../index.js";
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
			intensity: .75,
			position: new Vector3(64, 200, 64),
			direction: new Vector3(),
		}),
	);

	const position = new Vector3(50, ENTITY_HEIGHT_STAND, 0);

	camera.position = position.clone();
	camera.target = position.clone();

	const meshes = await (await fetch("public/hl2/scenes/building_entrance.json")).json();

	for (let i = 0, length = meshes.length; i < length; i++) {
		if (meshes[i].label == null) {
			continue;
		}

		scene.meshes.push(Mesh.fromJSON(meshes[i], textureDescriptors, renderer._textures));
	}
}