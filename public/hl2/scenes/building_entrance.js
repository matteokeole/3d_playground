import {PointLight} from "../../../src/lights/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Camera} from "../Camera.js";
import {SSDLoader} from "../Loader/SSDLoader.js";
import {ENTITY_HEIGHT_STAND, FIELD_OF_VIEW, SENSITIVITY} from "../main.js";
import {Scene} from "../Scene.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} images
 * @returns {Promise.<Scene>}
 */
export async function createScene(images) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(images);
	const meshes = await ssdLoader.load("public/hl2/scenes/building_entrance.json");

	const scene = new Scene(meshes);
	scene.setPointLight(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .75,
			position: new Vector3(),
			direction: new Vector3(),
		}),
	);

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(47.36, 146.50, 82.45));
	camera.target = camera.getPosition().clone();
	camera.setRotation(new Vector3(-1.57, 0, 0));

	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}