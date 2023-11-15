import {Renderer, Scene, Texture} from "../../../src/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND} from "../main.js";
import {Mesh} from "../Mesh.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {import("../../../src/Loader/TextureLoader.js").TextureDescriptor[]} textureDescriptors
 * @param {Object.<String, Texture>} textures
 * @returns {Promise.<Scene>}
 */
export async function createScene(textures, textureDescriptors) {
	const response = await fetch("public/hl2/scenes/building_entrance.json");
	const json = await response.json();
	const meshes = [];

	for (let i = 0, length = json.length; i < length; i++) {
		if (!("label" in json[i])) {
			continue;
		}

		meshes.push(Mesh.fromJSON(json[i], textures, textureDescriptors));
	}

	return new Scene(meshes);
}

/**
 * @param {Renderer} renderer
 * @param {import("../../../src/Loader/TextureLoader.js").TextureDescriptor[]} textureDescriptors
 */
export async function setup(renderer, textureDescriptors) {
	const scene = renderer.scene;
	const camera = renderer.camera;
	const position = new Vector3(50, ENTITY_HEIGHT_STAND, 0);

	scene.lights.push(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .75,
			position,
			direction: new Vector3(),
		}),
	);

	camera.position = position.clone();
	camera.target = position.clone();

	const meshes = await (await fetch("public/hl2/scenes/building_entrance.json")).json();

	for (let i = 0, length = meshes.length; i < length; i++) {
		if (meshes[i].label == null) {
			continue;
		}

		scene.meshes.push(Mesh.fromJSON(meshes[i], renderer._textures, textureDescriptors));
	}
}