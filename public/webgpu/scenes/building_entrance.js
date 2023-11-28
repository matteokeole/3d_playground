import {Scene} from "../../../src/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Camera} from "../../hl2/Camera.js";
import {ENTITY_HEIGHT_STAND, FIELD_OF_VIEW, SENSITIVITY} from "../../hl2/main.js";
import {Mesh} from "../Mesh.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} images
 */
export async function createScene(images) {
	const response = await fetch("public/webgpu/scenes/building_entrance.json");
	const json = await response.json();
	const meshes = [];

	const imagePaths = images.map(image => image.path);

	for (let i = 0, length = json.length; i < length; i++) {
		if (!("label" in json[i])) {
			continue;
		}

		meshes.push(Mesh.fromJson(json[i], images, imagePaths));
	}

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	// camera.setPosition(new Vector3(50, ENTITY_HEIGHT_STAND, 0));
	camera.setPosition(new Vector3(48.40, 188.37, 91.85));
	camera.rotation = new Vector3(-1.57, 0, 0);

	camera.target = camera.getPosition().clone();
	camera.fieldOfView = FIELD_OF_VIEW;

	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}