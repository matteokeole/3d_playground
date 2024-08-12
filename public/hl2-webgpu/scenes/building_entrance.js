import {Scene} from "../../../src/index.js";
import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {FIELD_OF_VIEW} from "../../index.js";
import {SENSITIVITY} from "../../hl2/main.js";
import {Mesh} from "../Mesh.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} images
 */
export async function createScene(images) {
	const response = await fetch("public/hl2/scenes/building_entrance.json");
	const json = await response.json();
	const parts = Object.values(json);
	const meshes = [];
	const imagePaths = images.map(image => image.path);

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];

		for (let j = 0; j < part.length; j++) {
			if (!("label" in part[j])) {
				continue;
			}

			const mesh = Mesh.fromJson(part[j], images, imagePaths);

			meshes.push(mesh);
		}
	}

	return new Scene(meshes);
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new PerspectiveCamera();

	// camera.setPosition(new Vector3(50, ENTITY_HEIGHT_STAND, 0));
	camera.setPosition(new Vector3(48.40, 188.37, 91.85));
	camera.setRotation(new Vector3(-1.57, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}