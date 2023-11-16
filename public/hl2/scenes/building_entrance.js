import {Scene, TextureImage} from "../../../src/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Camera} from "../Camera.js";
import {CAMERA_LERP_FACTOR, ENTITY_HEIGHT_STAND, FIELD_OF_VIEW, SENSITIVITY} from "../main.js";
import {Mesh} from "../Mesh.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {import("../../../src/Loader/TextureLoader.js").TextureDescriptor[]} textureDescriptors
 * @param {Object.<String, TextureImage>} textureImages
 * @returns {Promise.<Scene>}
 */
export async function createScene(textureImages) {
	const response = await fetch("public/hl2/scenes/building_entrance.json");
	const json = await response.json();
	const meshes = [];

	for (let i = 0, length = json.length; i < length; i++) {
		if (!("label" in json[i])) {
			continue;
		}

		meshes.push(Mesh.fromJSON(json[i], textureImages));
	}

	const scene = new Scene(meshes);

	scene.pointLight = new PointLight({
		color: new Vector3(1, 1, 1),
		intensity: .75,
		position: new Vector3(),
		direction: new Vector3(),
	});

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.position = new Vector3(50, ENTITY_HEIGHT_STAND, 0);
	camera.target = camera.position.clone();
	camera.fieldOfView = FIELD_OF_VIEW;

	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lerpFactor = CAMERA_LERP_FACTOR;
	camera.lookAt(new Vector2());

	return camera;
}