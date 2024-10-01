import {FIELD_OF_VIEW} from "../main.js";
import {ENTITY_HEIGHT_STAND, PLAYER_COLLISION_HULL} from "../../index.js";
import {Scene} from "../../hl2/Scene.js";
import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {Hull} from "../../../src/Hull/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Vector3} from "../../../src/math/index.js";

/**
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} imageBitmaps
 * @returns {Promise.<Scene>}
 */
export async function createScene(imageBitmaps) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(imageBitmaps);

	const meshes = await ssdLoader.load("public/collision/scenes/swept_aabb.json");

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
		position: new Vector3(0, ENTITY_HEIGHT_STAND, -128),
		/* hull: new Hull({
			geometry: new BoxGeometry(PLAYER_COLLISION_HULL),
		}), */
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 0.5,
		farClipPlane: 1000,
	});

	return camera;
}