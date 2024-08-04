import {Camera} from "../../../src/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND, FIELD_OF_VIEW} from "../../index.js";
import {SENSITIVITY} from "../main.js";
import {Scene} from "../Scene.js";

/**
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

	camera.setPosition(new Vector3(54, ENTITY_HEIGHT_STAND, 104));
	camera.setRotation(new Vector3(-.06, 0, 0));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}