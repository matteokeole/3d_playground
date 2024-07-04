import {PointLight} from "../../../src/lights/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {Material} from "../../../src/materials/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../hl2/Mesh.js";
import {Camera} from "../Camera.js";
import {Scene} from "../Scene.js";
import {SSDPlaneGeometry} from "../SSDPlaneGeometry.js";
import {PlayerOverheadObstacleHeight} from "../index.js";
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
		SSDPlaneGeometry.fromAnchors([
			new Vector3(-64, 0, 0),
			new Vector3(-64, 128, 0),
			new Vector3(64, 128, 0),
			new Vector3(64, 0, 0),
		]),
		new Material({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall030c.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall030c_normal.jpg"),
		}),
	);
	wall.setPosition(new Vector3(0, 128, -64));
	wall.buildHitbox();

	meshes.push(wall);

	/* const player = new Mesh(
		new BoxGeometry(new Vector3(16, 16, 16)),
		new Material({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "metal/metalcombine001.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "metal/metalcombine001_normal.jpg"),
		}),
	);
	player.setPosition(new Vector3(0, 8, 0));
	player.buildHitbox();

	meshes.push(player); */

	const scene = new Scene(meshes);

	scene.setPointLight(
		new PointLight({
			color: new Vector3(1, 1, 1),
			intensity: .5,
			position: new Vector3(0, 64, -128),
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

	camera.setPosition(new Vector3(0, PlayerOverheadObstacleHeight.STANDING, -64));
	camera.target = new Vector3(camera.getPosition());
	// camera.setRotation(new Vector3(-PI / 6, 0, 0));
	camera.setDistance(new Vector3(0, 0, -64));

	camera.fieldOfView = FIELD_OF_VIEW;
	camera.aspectRatio = aspectRatio;
	camera.near = .5;
	camera.far = 1000;
	camera.bias = PI * .545; // ~1.712
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2());

	return camera;
}