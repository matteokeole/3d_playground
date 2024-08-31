import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {BoxGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {PI, Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {SENSITIVITY} from "../../../hl2/main.js";
import {Mesh} from "../../../hl2/Mesh.js";
import {FIELD_OF_VIEW, FRAMES_PER_SECOND, PLAYER_COLLISION_HULL, PLAYER_VIEWPOINT} from "../../../index.js";
import {listen} from "../input.js";
import {Instance} from "../Instance.js";
import {Renderer} from "../Renderer.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new Renderer(canvas);
	const instance = new Instance({
		renderer,
		framesPerSecond: FRAMES_PER_SECOND,
	});

	await instance.build();

	await renderer.loadShader(
		"visibility",
		"public/webgpu/visibility/shaders/visibility.wgsl",
		"public/webgpu/visibility/shaders/visibility.vert.wgsl",
		"public/webgpu/visibility/shaders/visibility.frag.wgsl",
	);
	await renderer.loadShader(
		"material",
		"public/webgpu/visibility/shaders/base.vert.wgsl",
		"public/webgpu/visibility/shaders/base.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[0], viewport[1]));
	renderer.resize();

	const scene = createScene();
	const camera = createCamera();

	camera.aspectRatio = viewport[0] / viewport[1];

	renderer.setScene(scene);
	renderer.setCamera(camera);

	document.body.appendChild(canvas);
	listen(renderer);

	instance.loop();
}

/**
 * @see {@link https://www.graphics.cornell.edu/online/box/data}
 */
function createScene() {
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

	const plane = new Mesh(planeGeometry, null);
	plane.setPosition(new Vector3(0, 0, 0));
	plane.updateProjection();

	const squareWall1 = new Mesh(squareWallGeometry, null);
	squareWall1.setPosition(new Vector3(128, 0, 0));
	squareWall1.updateProjection();

	const squareWall2 = new Mesh(squareWallGeometry, null);
	squareWall2.setPosition(new Vector3(256, 0, 0));
	squareWall2.updateProjection();

	const squareWall3 = new Mesh(squareWallGeometry, null);
	squareWall3.setPosition(new Vector3(384, 0, 0));
	squareWall3.updateProjection();

	const squareWall4 = new Mesh(squareWallGeometry, null);
	squareWall4.setPosition(new Vector3(512, 0, 0));
	squareWall4.updateProjection();

	const leftBox = new Mesh(boxGeometry, null);
	leftBox.setPosition(new Vector3(-112, 24, 32));
	leftBox.setScale(new Vector3(32, 48, 192));
	leftBox.updateProjection();

	const bridge = new Mesh(boxGeometry, null);
	bridge.setPosition(new Vector3(-64, 42, 96));
	bridge.setScale(new Vector3(64, 12, 64));
	bridge.updateProjection();

	const centerBox = new Mesh(boxGeometry, null);
	centerBox.setPosition(new Vector3(16, 24, 96));
	centerBox.setScale(new Vector3(96, 48, 64));
	centerBox.updateProjection();

	const rightBox = new Mesh(boxGeometry, null);
	rightBox.setPosition(new Vector3(96, 24, 64));
	rightBox.setScale(new Vector3(64, 48, 128));
	rightBox.updateProjection();

	const slope = new Mesh(slopeGeometry, null);
	slope.setPosition(new Vector3(96, 24, -24));
	slope.setScale(new Vector3(64, 48, 48));
	slope.updateProjection();

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(planeGeometry, [plane]);
	// scene.addMeshes(boxGeometry, [leftBox, bridge, centerBox, rightBox]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(squareWallGeometry, [squareWall1, squareWall2, squareWall3, squareWall4]);

	return scene;
}

function createCamera() {
	const hull = new Mesh(new BoxGeometry(PLAYER_COLLISION_HULL), null);
	hull.setPosition(new Vector3(0, 40, 0));
	hull.updateProjection();

	const camera = new PerspectiveCamera();
	camera.setPosition(new Vector3(0, 64, -64));
	camera.fieldOfView = FIELD_OF_VIEW;
	camera.near = 1;
	camera.far = 10000;
	camera.bias = PI * .545;
	camera.turnVelocity = SENSITIVITY;
	camera.lookAt(new Vector2(0, 0));
	camera.setHull(hull);
	camera.setViewpoint(PLAYER_VIEWPOINT);

	return camera;
}