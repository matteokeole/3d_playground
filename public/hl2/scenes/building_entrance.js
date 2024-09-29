import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND, FIELD_OF_VIEW} from "../../index.js";
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

export function createCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(54, ENTITY_HEIGHT_STAND, 104),
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 0.5,
		farClipPlane: 1000,
	});

	return camera;
}