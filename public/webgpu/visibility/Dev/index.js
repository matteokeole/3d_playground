import {BoxGeometry, PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FIELD_OF_VIEW, FRAMES_PER_SECOND} from "../../../index.js";
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
		geometry: boxGeometry,
		proxyGeometry: boxGeometry,
		material: null,
		debugName: "player",
	});
	player.setPosition(new Vector3(0, 12, 0));
	player.setScale(new Vector3(24, 24, 24));
	player.updateWorld();

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(planeGeometry, [plane]);
	scene.addMeshes(slopeGeometry, [slope]);
	scene.addMeshes(boxGeometry, [player, leftBox, bridge, centerBox, rightBox]);
	scene.addMeshes(squareWallGeometry, [squareWall1, squareWall2, squareWall3, squareWall4]);

	return scene;
}

function createCamera() {
	const camera = new ThirdPersonCamera({
		position: new Vector3(0, 24, 0),
		fieldOfView: FIELD_OF_VIEW,
		nearClipPlane: 1,
		farClipPlane: 2000,
	});

	camera.update();

	return camera;
}