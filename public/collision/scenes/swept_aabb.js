import {Camera} from "../../../src/index.js";
import {BoxGeometry} from "../../../src/Geometry/BoxGeometry.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Material} from "../../../src/Material/Material.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../hl2/Mesh.js";
import {Scene} from "../Scene.js";
import {PLAYER_COLLISION_HULL} from "../index.js";
import {FIELD_OF_VIEW, SENSITIVITY} from "../main.js";

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
		new Material({
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
		new Material({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "debug.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "normal.jpg"),
		}),
		"playerHitbox",
	);
	playerHitbox.setPosition(new Vector3(0, PLAYER_COLLISION_HULL[1], -128));
	playerHitbox.buildHitbox();

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

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, PLAYER_COLLISION_HULL[1], -128));
	camera.target = new Vector3(camera.getPosition());
	camera.setRotation(new Vector3(-PI / 6, 0, 0));
	// camera.setDistance(new Vector3(0, 0, -64));

	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}