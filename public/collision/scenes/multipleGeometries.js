import {Camera} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {TextureMaterial} from "../../../src/Material/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {ENTITY_HEIGHT_STAND} from "../../index.js";
import {SENSITIVITY} from "../../hl2/main.js";
import {Mesh} from "../../hl2/Mesh.js";
import {Scene} from "../../hl2/Scene.js";

/**
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} imageBitmaps
 */
export async function createScene(imageBitmaps) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(imageBitmaps);

	const meshes = await ssdLoader.load("public/collision/scenes/swept_aabb.json");

	const player = new Mesh(
		new BoxGeometry(new Vector3(16, 128, 16)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c_normal.jpg"),
		}),
		"player",
	);
	player.setPosition(new Vector3(0, 0, 0));
	player.updateProjection();
	player.setIsTiedToCamera(true);
	meshes.push(player);

	const box = new Mesh(
		new BoxGeometry(new Vector3(512, 128, 16)),
		new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c_normal.jpg"),
		}),
		"wall",
	);
	box.setPosition(new Vector3(0, 0, 0));
	box.updateProjection();
	meshes.push(box);

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

	camera.setPosition(new Vector3(0, ENTITY_HEIGHT_STAND, -128));
	camera.fieldOfView = 90;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));

	return camera;
}