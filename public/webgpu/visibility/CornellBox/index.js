import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FRAMES_PER_SECOND} from "../../../index.js";
import {Instance} from "../Instance.js";
import {VisibilityRenderer} from "../VisibilityRenderer.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new VisibilityRenderer(canvas);
	const instance = new Instance({
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
		"public/webgpu/visibility/CornellBox/Shader/Material.vert.wgsl",
		"public/webgpu/visibility/CornellBox/Shader/Material.frag.wgsl",
	);

	const viewport = new Vector2(innerWidth, innerHeight);
	renderer.setViewport(new Vector4(0, 0, viewport[1], viewport[1]));
	renderer.resize();

	const scene = createCornellBoxScene();
	const camera = createCornellBoxCamera();

	renderer.setScene(scene);
	renderer.setCamera(camera);

	document.body.appendChild(canvas);

	instance.loop();
}

/**
 * @see {@link https://www.graphics.cornell.edu/online/box/data}
 */
function createCornellBoxScene() {
	///
	/// Geometries
	///

	const floorGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			552.8, 0.0,   0.0,
			  0.0, 0.0,   0.0,
			  0.0, 0.0, 559.2,
			549.6, 0.0, 559.2,
		),
	});
	const lightGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			343.0, 548.8, 227.0,
			343.0, 548.8, 332.0,
			213.0, 548.8, 332.0,
			213.0, 548.8, 227.0,
		),
	});
	const ceilingGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			556.0, 548.8,   0.0,
			556.0, 548.8, 559.2,
			  0.0, 548.8, 559.2,
			  0.0, 548.8,   0.0,
		),
	});
	const backWallGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			549.6,   0.0, 559.2,
			  0.0,   0.0, 559.2,
			  0.0, 548.8, 559.2,
			556.0, 548.8, 559.2,
		),
	});
	const rightWallGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			0.0,   0.0, 559.2,
			0.0,   0.0,   0.0,
			0.0, 548.8,   0.0,
			0.0, 548.8, 559.2,
		),
	});
	const leftWallGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		vertices: Float32Array.of(
			552.8,   0.0,   0.0,
			549.6,   0.0, 559.2,
			556.0, 548.8, 559.2,
			556.0, 548.8,   0.0,
		),
	});
	const shortBlockGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
			4, 5, 6,
			4, 6, 7,
			8, 9, 10,
			8, 10, 11,
			12, 13, 14,
			12, 14, 15,
			16, 17, 18,
			16, 18, 19,
		),
		vertices: Float32Array.of(
			130.0, 165.0,  65.0,
			82.0,  165.0, 225.0,
			240.0, 165.0, 272.0,
			290.0, 165.0, 114.0,
			290.0,   0.0, 114.0,
			290.0, 165.0, 114.0,
			240.0, 165.0, 272.0,
			240.0,   0.0, 272.0,
			130.0,   0.0,  65.0,
			130.0, 165.0,  65.0,
			290.0, 165.0, 114.0,
			290.0,   0.0, 114.0,
			82.0,    0.0, 225.0,
			82.0,  165.0, 225.0,
			130.0, 165.0,  65.0,
			130.0,   0.0,  65.0,
			240.0,   0.0, 272.0,
			240.0, 165.0, 272.0,
			82.0,  165.0, 225.0,
			82.0,    0.0, 225.0,
		),
	});
	const tallBlockGeometry = new PolytopeGeometry({
		indices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
			4, 5, 6,
			4, 6, 7,
			8, 9, 10,
			8, 10, 11,
			12, 13, 14,
			12, 14, 15,
			16, 17, 18,
			16, 18, 19,
		),
		vertices: Float32Array.of(
			423.0, 330.0, 247.0,
			265.0, 330.0, 296.0,
			314.0, 330.0, 456.0,
			472.0, 330.0, 406.0,
			423.0,   0.0, 247.0,
			423.0, 330.0, 247.0,
			472.0, 330.0, 406.0,
			472.0,   0.0, 406.0,
			472.0,   0.0, 406.0,
			472.0, 330.0, 406.0,
			314.0, 330.0, 456.0,
			314.0,   0.0, 456.0,
			314.0,   0.0, 456.0,
			314.0, 330.0, 456.0,
			265.0, 330.0, 296.0,
			265.0,   0.0, 296.0,
			265.0,   0.0, 296.0,
			265.0, 330.0, 296.0,
			423.0, 330.0, 247.0,
			423.0,   0.0, 247.0,
		),
	});

	///
	/// Meshes
	///

	const floor = new Mesh(floorGeometry, null);
	const light = new Mesh(lightGeometry, null);
	const ceiling = new Mesh(ceilingGeometry, null);
	const backWall = new Mesh(backWallGeometry, null);
	const rightWall = new Mesh(rightWallGeometry, null);
	const leftWall = new Mesh(leftWallGeometry, null);
	const shortBlock = new Mesh(shortBlockGeometry, null);
	const tallBlock = new Mesh(tallBlockGeometry, null);

	///
	/// Scene
	///

	const scene = new Scene();

	scene.addMeshes(floorGeometry, [floor]);
	scene.addMeshes(lightGeometry, [light]);
	scene.addMeshes(ceilingGeometry, [ceiling]);
	scene.addMeshes(backWallGeometry, [backWall]);
	scene.addMeshes(rightWallGeometry, [rightWall]);
	scene.addMeshes(leftWallGeometry, [leftWall]);
	scene.addMeshes(shortBlockGeometry, [shortBlock]);
	scene.addMeshes(tallBlockGeometry, [tallBlock]);

	return scene;
}

function createCornellBoxCamera() {
	const camera = new PerspectiveCamera({
		position: new Vector3(278, 273, -800),
		fieldOfView: 35, // Debug
		nearClipPlane: 0.01,
		farClipPlane: 2000,
	});

	camera.setAspectRatio(1);

	return camera;
}