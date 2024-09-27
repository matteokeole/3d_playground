import {PerspectiveCamera} from "../../../src/Camera/index.js";
import {BoxGeometry} from "../../../src/Geometry/index.js";
import {PointLight} from "../../../src/Light/index.js";
import {SSDLoader} from "../../../src/Loader/index.js";
import {TextureMaterial} from "../../../src/Material/index.js";
import {Matrix3, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";
import {ENTITY_HEIGHT_STAND} from "../../index.js";
import {Scene} from "../../hl2/Scene.js";

/**
 * @param {import("../../../src/Loader/ImageBitmapLoader.js").Image[]} imageBitmaps
 */
export async function createScene(imageBitmaps) {
	const ssdLoader = new SSDLoader();
	ssdLoader.setImages(imageBitmaps);

	const meshes = await ssdLoader.load("public/collision/scenes/swept_aabb.json");
	const box = new Mesh({
		geometry: new BoxGeometry(new Vector3(512, 128, 16)),
		material: new TextureMaterial({
			textureMatrix: Matrix3.identity(),
			textureIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c.jpg"),
			normalMapIndex: imageBitmaps.findIndex(texture => texture.path === "plaster/plasterwall044c_normal.jpg"),
		}),
		debugName: "wall",
	});

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

export function createCamera() {
	const proxyGeometry = new BoxGeometry(new Vector3(16, 128, 16));

	const camera = new PerspectiveCamera({
		position: new Vector3(0, ENTITY_HEIGHT_STAND, -128),
		proxyGeometry,
		fieldOfView: 90,
		nearClipPlane: 0.5,
		farClipPlane: 1000,
	});

	return camera;
}