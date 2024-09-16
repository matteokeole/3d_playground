import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Vector3} from "../../../src/math/index.js";
import {FIELD_OF_VIEW, PLAYER_COLLISION_HULL} from "../../index.js";
import {Scene} from "../Scene.js";

/**
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} imageBitmaps
 * @returns {Promise.<Scene>}
 */
export async function createScene(imageBitmaps) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(imageBitmaps);

	const meshes = await ssdLoader.load("public/hl2/scenes/room.json");

	const scene = new Scene(meshes);
	scene.setPointLight(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .5,
			position: new Vector3(128, 128, -128),
			direction: new Vector3(),
		}),
	);

	return scene;
}

export function createCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(0, PLAYER_COLLISION_HULL[1], -128),
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 0.5,
		farClipPlane: 1000,
	});

	return camera;
}