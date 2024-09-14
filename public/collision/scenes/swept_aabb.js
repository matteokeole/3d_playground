import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {TextureMaterial} from "../../../src/Material/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../hl2/Mesh.js";
import {Scene} from "../../hl2/Scene.js";
import {ENTITY_HEIGHT_STAND, PLAYER_COLLISION_HULL} from "../../index.js";
import {FIELD_OF_VIEW} from "../main.js";

/**
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} imageBitmaps
 * @returns {Promise.<Scene>}
 */
export async function createScene(imageBitmaps) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(imageBitmaps);

	const meshes = await ssdLoader.load("public/collision/scenes/swept_aabb.json");

	const wall = new Mesh(
		new BoxGeometry(new Vector3(512, 128, 16)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c_normal.jpg"),
		}),
		"wall",
	);
	wall.setPosition(new Vector3(0, 64, 0));
	wall.buildHitbox();

	meshes.push(wall);

	const playerHitbox = new Mesh(
		new BoxGeometry(PLAYER_COLLISION_HULL),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "debug.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "normal.jpg"),
		}),
		"playerHitbox",
	);
	playerHitbox.setPosition(new Vector3(0, ENTITY_HEIGHT_STAND, -128));
	playerHitbox.buildHitbox();
	playerHitbox.setIsTiedToCamera(true);

	meshes.push(playerHitbox);

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
		hull: null,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 0.5,
		farClipPlane: 1000,
	});

	return camera;
}