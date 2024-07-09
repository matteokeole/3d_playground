import {Camera} from "../../../src/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {PI, Vector2, Vector3} from "../../../src/math/index.js";
import {PLAYER_COLLISION_HULL} from "../../collision/index.js";
import {Scene} from "../Scene.js";
import {FIELD_OF_VIEW, SENSITIVITY} from "../main.js";

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

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, PLAYER_COLLISION_HULL[1], -128));
	camera.target = new Vector3(camera.getPosition());

	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}