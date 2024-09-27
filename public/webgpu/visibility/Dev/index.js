import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {BoxGeometry, Geometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {FileLoader} from "../../../../src/Loader/index.js";
import {PI, Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {OBJParser} from "../../../../src/Parser/Text/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {FIELD_OF_VIEW, FRAMES_PER_SECOND, PLAYER_COLLISION_HULL} from "../../../index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";
import {DevInstance} from "./DevInstance.js";
import {Hull} from "../../../../src/Hull/Hull.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new VisibilityRenderer(canvas);
	const instance = new DevInstance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	await instance.build();

	await renderer.loadShader(
		"visibility",
		"public/webgpu/visibility/Shader/Visibility.wgsl",
		"public/webgpu/visibility/Shader/Visibility.vert.wgsl",
		"public/webgpu/visibility/Shader/Visibility.frag.wgsl",
	);
	await renderer.loadShader(
		"material",
		"public/webgpu/visibility/Shader/Material.wgsl",
		"public/webgpu/visibility/Shader/Material.vert.wgsl",
		"public/webgpu/visibility/Shader/Material.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	const scene = await createScene();

	scene.clusterize();

	renderer.setScene(scene);

	const camera = createCamera();

	camera.setAspectRatio(viewport[0] / viewport[1]);

	renderer.setCamera(camera);

	document.body.appendChild(canvas);

	instance.loop();
}

/**
 * @see {@link https://www.graphics.cornell.edu/online/box/data}
 */
async function createScene() {
	///
	/// Geometries
	///

	const planeGeometry = new BoxGeometry(new Vector3(2560, 0, 2560));
	const squareWallGeometry = new PolytopeGeometry({
		vertices: Float32Array.of(
			0,   0,   0,
			0,   128, 0,
			128, 128, 0,
			128, 0,   0,
		),
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
	});
	const boxGeometry = new BoxGeometry(new Vector3(1, 1, 1));
	const slopeGeometry = new PolytopeGeometry({
		vertices: Float32Array.of(
			-0.5,  0.5,  0.5,
			 0.5,  0.5,  0.5,
			-0.5, -0.5, -0.8,
			 0.5, -0.5, -0.8,
			-0.5, -0.5,  0.5,
			 0.5, -0.5,  0.5,
		),
		indices: Uint32Array.of(
			0, 1, 2,
			1, 3, 2,
			0, 2, 4,
			1, 5, 3,
			1, 0, 5,
			0, 4, 5,
			2, 3, 4,
			3, 5, 4,
		),
	});

	///
	/// Meshes
	///

	const plane = new Mesh({
		geometry: planeGeometry,
		material: null,
		hull: new Hull({
			geometry: new BoxGeometry(new Vector3(2560, 1, 2560)),
		}),
	});
	plane.setPosition(new Vector3(0, 0, 0));
	plane.updateWorld();

	const squareWall1 = new Mesh({
		geometry: squareWallGeometry,
		material: null,
		hull: new Hull({
			geometry: squareWallGeometry,
		}),
	});
	squareWall1.setPosition(new Vector3(128, 0, 0));
	squareWall1.updateWorld();

	const squareWall2 = new Mesh({
		geometry: squareWallGeometry,
		material: null,
		hull: new Hull({
			geometry: squareWallGeometry,
		}),
	});
	squareWall2.setPosition(new Vector3(256, 0, 0));
	squareWall2.updateWorld();

	const squareWall3 = new Mesh({
		geometry: squareWallGeometry,
		material: null,
		hull: new Hull({
			geometry: squareWallGeometry,
		}),
	});
	squareWall3.setPosition(new Vector3(384, 0, 0));
	squareWall3.updateWorld();

	const squareWall4 = new Mesh({
		geometry: squareWallGeometry,
		material: null,
		hull: new Hull({
			geometry: squareWallGeometry,
		}),
	});
	squareWall4.setPosition(new Vector3(512, 0, 0));
	squareWall4.updateWorld();

	const leftBox = new Mesh({
		geometry: boxGeometry,
		material: null,
		hull: new Hull({
			geometry: boxGeometry,
		}),
	});
	leftBox.setPosition(new Vector3(-112, 24, 32));
	leftBox.setScale(new Vector3(32, 48, 192));
	leftBox.updateWorld();

	const bridge = new Mesh({
		geometry: boxGeometry,
		material: null,
		hull: new Hull({
			geometry: boxGeometry,
		}),
	});
	bridge.setPosition(new Vector3(-64, 42, 96));
	bridge.setScale(new Vector3(64, 12, 64));
	bridge.updateWorld();

	const centerBox = new Mesh({
		geometry: boxGeometry,
		material: null,
		hull: new Hull({
			geometry: boxGeometry,
		}),
	});
	centerBox.setPosition(new Vector3(16, 24, 96));
	centerBox.setScale(new Vector3(96, 48, 64));
	centerBox.updateWorld();

	const rightBox = new Mesh({
		geometry: boxGeometry,
		material: null,
		hull: new Hull({
			geometry: boxGeometry,
		}),
	});
	rightBox.setPosition(new Vector3(96, 24, 64));
	rightBox.setScale(new Vector3(64, 48, 128));
	rightBox.updateWorld();

	const slope = new Mesh({
		geometry: slopeGeometry,
		material: null,
		hull: new Hull({
			geometry: slopeGeometry,
		}),
	});
	slope.setPosition(new Vector3(96, 24, -24));
	slope.setScale(new Vector3(64, 48, 48));
	slope.updateWorld();

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(planeGeometry, [plane]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(boxGeometry, [leftBox, bridge, centerBox, rightBox]);
	scene.addMeshes(squareWallGeometry, [squareWall1, squareWall2, squareWall3, squareWall4]);

	return scene;
}

async function createLookAtTestScene() {
	const fileLoader = new FileLoader();
	const response = await fileLoader.load("assets/models/Suzanne/Suzanne2.obj");
	const text = await response.text();

	const objParser = new OBJParser();
	const obj = objParser.parse(text);

	const geometry = new Geometry({
		vertices: obj.vertices,
		indices: obj.indices,
		normals: obj.normals,
		tangents: Float32Array.of(),
		uvs: Float32Array.of(),
	});

	const response2 = await fileLoader.load("assets/models/Bunny/bunny_high.obj");
	const text2 = await response2.text();
	const obj2 = objParser.parse(text2);
	const geometry2 = new Geometry({
		vertices: obj2.vertices,
		indices: obj2.indices,
		normals: obj2.normals,
		tangents: Float32Array.of(),
		uvs: Float32Array.of(),
	});

	const mesh = new Mesh({
		geometry,
		material: null,
	});
	const mesh2 = new Mesh({
		geometry: geometry2,
		material: null,
	});

	mesh2.setPosition(new Vector3(1.5, 0, 3.5));
	mesh2.setRotation(new Vector3(0, PI, 0));
	mesh2.updateWorld();

	mesh.setPosition(new Vector3(-1.5, 0, 3.5));
	mesh.setRotation(new Vector3(0, PI, 0));
	mesh.updateWorld();

	const scene = new Scene();

	scene.addMeshes(geometry, [mesh]); // Suzanne
	scene.addMeshes(geometry2, [mesh2]); // Bunny

	return scene;
}

function createCamera() {
	const hull = new Hull({
		geometry: new BoxGeometry(PLAYER_COLLISION_HULL),
	});

	const camera = new PerspectiveCamera({
		position: new Vector3(0, 64, -64),
		hull,
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 1,
		farClipPlane: 10000,
	});

	camera.update();

	/**
	 * @todo
	 */
	// camera.setViewpoint(PLAYER_VIEWPOINT);

	return camera;
}

function createLookAtTestCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(0, 0, 0),
		hull: null,
		fieldOfView: 60,
		nearClipPlane: 0.1,
		farClipPlane: 1000,
	});

	return camera;
}