import {BoxGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FRAMES_PER_SECOND, PLAYER_COLLISION_HULL} from "../../../index.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";
import {DevInstance} from "./DevInstance.js";
import {ThirdPersonCamera} from "./ThirdPersonCamera.js";

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

	const scene = await createSourceScene();

	scene.clusterize();

	renderer.setScene(scene);

	const camera = createCamera();

	camera.setAspectRatio(viewport[0] / viewport[1]);

	renderer.setCamera(camera);

	document.body.appendChild(canvas);

	instance.loop();
}

/**
 * Creates a scene with Source Engine proportions (roughly)
 */
async function createSourceScene() {
	/*
	#gravity = new Vector3(0, -600, 0);
	#speed = 450; // Acceleration rate - same for forward/back/side
	#groundAccelerateConstant = 10;
	#airAccelerateConstant = 10;
	#stopSpeed = 0.1;
	#normSpeed = 190; // Normal speed
	#walkSpeed = 150;
	#sprintSpeed = 320;
	#jumpSpeed = 320; // Up speed
	#maxSpeed = 270;
	#stopSpeed = 100;
	#pitchSpeed = 225;
	#yawSpeed = 210;
	#friction = 4; // Not from HL2: https://developer.valvesoftware.com/wiki/Sv_friction
	*/

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
	const playerGeometry = new BoxGeometry(PLAYER_COLLISION_HULL);

	///
	/// Meshes
	///

	const plane = new Mesh({
		ground: true,
		geometry: planeGeometry,
		proxyGeometry: planeGeometry,
		material: null,
	});
	plane.setPosition(new Vector3(0, 0, 0));
	plane.updateWorld();

	const squareWall1 = new Mesh({
		geometry: squareWallGeometry,
		proxyGeometry: squareWallGeometry,
		material: null,
	});
	squareWall1.setPosition(new Vector3(128, 0, 0));
	squareWall1.updateWorld();

	const squareWall2 = new Mesh({
		geometry: squareWallGeometry,
		proxyGeometry: squareWallGeometry,
		material: null,
	});
	squareWall2.setPosition(new Vector3(256, 0, 0));
	squareWall2.updateWorld();

	const squareWall3 = new Mesh({
		geometry: squareWallGeometry,
		proxyGeometry: squareWallGeometry,
		material: null,
	});
	squareWall3.setPosition(new Vector3(384, 0, 0));
	squareWall3.updateWorld();

	const squareWall4 = new Mesh({
		geometry: squareWallGeometry,
		proxyGeometry: squareWallGeometry,
		material: null,
	});
	squareWall4.setPosition(new Vector3(512, 0, 0));
	squareWall4.updateWorld();

	const leftBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	leftBox.setPosition(new Vector3(-112, 24, 32));
	leftBox.setScale(new Vector3(32, 48, 192));
	leftBox.updateWorld();

	const bridge = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	bridge.setPosition(new Vector3(-64, 42, 96));
	bridge.setScale(new Vector3(64, 12, 64));
	bridge.updateWorld();

	const centerBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	centerBox.setPosition(new Vector3(16, 24, 96));
	centerBox.setScale(new Vector3(96, 48, 64));
	centerBox.updateWorld();

	const rightBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	rightBox.setPosition(new Vector3(96, 24, 64));
	rightBox.setScale(new Vector3(64, 48, 128));
	rightBox.updateWorld();

	const slope = new Mesh({
		geometry: slopeGeometry,
		proxyGeometry: slopeGeometry,
		material: null,
	});
	slope.setPosition(new Vector3(96, 24, -24));
	slope.setScale(new Vector3(64, 48, 48));
	slope.updateWorld();

	const player = new Mesh({
		geometry: playerGeometry,
		// proxyGeometry: playerGeometry,
		material: null,
		debugName: "player",
	});
	player.setPosition(new Vector3(0, 36.5, 0));
	player.updateWorld();

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(planeGeometry, [plane]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(boxGeometry, [leftBox, bridge, centerBox, rightBox]);
	scene.addMeshes(squareWallGeometry, [squareWall1, squareWall2, squareWall3, squareWall4]);
	scene.addMeshes(playerGeometry, [player]);

	return scene;
}

/**
 * Creates a scene with realistic proportions (roughly)
 */
async function createIrlScene() {
	/*
	#gravity = new Vector3(0, -9.80665, 0);
	#jumpSpeed = 2;
	#stopSpeed = 0.1;
	#walkSpeed = 3.5; // 1.4 irl
	#friction = 7;
	*/

	///
	/// Geometries
	///

	const planeGeometry = new BoxGeometry(new Vector3(6, 0, 6));
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
	const playerGeometry = new BoxGeometry(new Vector3(0.45, 1.75, 0.45));

	///
	/// Meshes
	///

	const plane1 = new Mesh({
		ground: true,
		geometry: planeGeometry,
		proxyGeometry: planeGeometry,
		material: null,
	});
	plane1.setPosition(new Vector3(0, 0, 0));
	plane1.updateWorld();

	const plane2 = new Mesh({
		ground: true,
		geometry: planeGeometry,
		proxyGeometry: planeGeometry,
		material: null,
	});
	plane2.setPosition(new Vector3(0, -2, 0));
	plane2.setScale(new Vector3(2, 0, 2));
	plane2.updateWorld();

	const leftBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	leftBox.setPosition(new Vector3(-112, 24, 32).divideScalar(64));
	leftBox.setScale(new Vector3(32, 48, 192).divideScalar(64));
	leftBox.updateWorld();

	const bridge = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	bridge.setPosition(new Vector3(-64, 42, 96).divideScalar(64));
	bridge.setScale(new Vector3(64, 12, 64).divideScalar(64));
	bridge.updateWorld();

	const centerBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	centerBox.setPosition(new Vector3(16, 24, 96).divideScalar(64));
	centerBox.setScale(new Vector3(96, 48, 64).divideScalar(64));
	centerBox.updateWorld();

	const rightBox = new Mesh({
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
	});
	rightBox.setPosition(new Vector3(1.5, 0.88 / 2, 1));
	rightBox.setScale(new Vector3(1, 0.88, 2));
	rightBox.updateWorld();

	const slope = new Mesh({
		geometry: slopeGeometry,
		proxyGeometry: slopeGeometry,
		material: null,
	});
	slope.setPosition(new Vector3(96, 24, -24).divideScalar(64));
	slope.setScale(new Vector3(64, 48, 48).divideScalar(64));
	slope.updateWorld();

	const player = new Mesh({
		geometry: playerGeometry,
		proxyGeometry: playerGeometry,
		material: null,
		debugName: "player",
	});
	player.setPosition(new Vector3(0, 2, 0));
	player.updateWorld();

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(planeGeometry, [plane1, plane2]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(boxGeometry, [leftBox, bridge, centerBox, rightBox]);
	scene.addMeshes(playerGeometry, [player]);

	return scene;
}

function createCamera() {
	const camera = new ThirdPersonCamera({
		position: new Vector3(0, 0, 0),
		distance: 0,
		fieldOfView: 75,
		nearClipPlane: 0.1,
		farClipPlane: 1000,
	});

	camera.update();

	return camera;
}