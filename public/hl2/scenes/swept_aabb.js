import {Scene, TextureImage} from "../../../src/index.js";
import {PointLight} from "../../../src/lights/index.js";
import {Matrix3, PI, Vector2, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../Mesh.js";
import {Camera} from "../Camera.js";
import {FIELD_OF_VIEW, SENSITIVITY} from "../main.js";
import {BoxGeometry} from "../../../src/geometries/index.js";
import {Material} from "../../../src/materials/index.js";

/**
 * @todo Use a loader to fetch the scene geometry file
 * 
 * @param {Object.<String, TextureImage>} textures
 * @returns {Promise.<Scene>}
 */
export async function createScene(textures) {
	const response = await fetch("public/hl2/scenes/swept_aabb.json");
	const json = await response.json();
	const meshes = [];

	for (let i = 0, length = json.length; i < length; i++) {
		if (!("label" in json[i])) {
			continue;
		}

		meshes.push(Mesh.fromJson(json[i], textures));
	}

	const wall = new Mesh(
		new BoxGeometry(new Vector3(64, 64, 0)),
		new Material({
			textureMatrix: Matrix3.identity(),
			texture: textures["plaster/plasterwall030c.jpg"],
			normalMap: textures["plaster/plasterwall030c_normal.jpg"],
		}),
	);
	wall.setPosition(new Vector3(0, 32, 64));
	wall.buildHitbox();

	const player = new Mesh(
		new BoxGeometry(new Vector3(16, 16, 16)),
		new Material({
			textureMatrix: Matrix3.identity(),
			texture: textures["metal/metalcombine001.jpg"],
			normalMap: textures["metal/metalcombine001_normal.jpg"],
		}),
	);
	player.setPosition(new Vector3(0, 8, 0));
	player.buildHitbox();

	meshes.push(wall, player);

	const scene = new Scene(meshes);

	scene.pointLight = new PointLight({
		color: new Vector3(1, 1, 1),
		intensity: .5,
		position: new Vector3(0, 64, -128),
		direction: new Vector3(),
	});

	return scene;
}

/**
 * @param {Number} aspectRatio
 */
export function createCamera(aspectRatio) {
	const camera = new Camera();

	camera.setPosition(new Vector3(0, 8, 0));
	camera.target = camera.getPosition().clone();
	camera.rotation = new Vector3(-PI / 6, 0, 0);
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