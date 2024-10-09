import {PerspectiveCamera} from "../../../../src/Camera/index.js";
import {PolytopeGeometry} from "../../../../src/Geometry/index.js";
import {Vector2, Vector3, Vector4} from "../../../../src/math/index.js";
import {Mesh} from "../../../../src/Mesh/index.js";
import {Scene} from "../../../../src/Scene/index.js";
import {FRAMES_PER_SECOND} from "../../../index.js";
import {FreecamDevInstance} from "../Dev/FreecamDevInstance.js";
import {WebGPUVisibilityRenderer} from "../../../../src/Platform/WebGPU/Renderer/index.js";

export default async function() {
	const canvas = document.createElement("canvas");
	const renderer = new WebGPUVisibilityRenderer(canvas);
	const instance = new FreecamDevInstance({
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

	scene.clusterize();

	renderer.setScene(scene);

	const camera = createCornellBoxCamera();

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
		positions: Float32Array.of(
			552.8, 0.0,   0.0,
			  0.0, 0.0,   0.0,
			  0.0, 0.0, 559.2,
			549.6, 0.0, 559.2,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const lightGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
			343.0, 548.8, 227.0,
			343.0, 548.8, 332.0,
			213.0, 548.8, 332.0,
			213.0, 548.8, 227.0,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const ceilingGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
			556.0, 548.8,   0.0,
			556.0, 548.8, 559.2,
			  0.0, 548.8, 559.2,
			  0.0, 548.8,   0.0,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const backWallGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
			549.6,   0.0, 559.2,
			  0.0,   0.0, 559.2,
			  0.0, 548.8, 559.2,
			556.0, 548.8, 559.2,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const rightWallGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
			0.0,   0.0, 559.2,
			0.0,   0.0,   0.0,
			0.0, 548.8,   0.0,
			0.0, 548.8, 559.2,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const leftWallGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
			552.8,   0.0,   0.0,
			549.6,   0.0, 559.2,
			556.0, 548.8, 559.2,
			556.0, 548.8,   0.0,
		),
		positionIndices: Uint32Array.of(
			0, 1, 2,
			0, 2, 3,
		),
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const shortBlockGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
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
		positionIndices: Uint32Array.of(
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
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});
	const tallBlockGeometry = new PolytopeGeometry({
		positions: Float32Array.of(
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
		positionIndices: Uint32Array.of(
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
		normals: Float32Array.of(),
		normalIndices: Uint32Array.of(),
	});

	///
	/// Meshes
	///

	const floor = new Mesh({
		solid: false,
		geometry: floorGeometry,
		material: null,
	});
	const light = new Mesh({
		solid: false,
		geometry: lightGeometry,
		material: null,
	});
	const ceiling = new Mesh({
		solid: false,
		geometry: ceilingGeometry,
		material: null,
	});
	const backWall = new Mesh({
		solid: false,
		geometry: backWallGeometry,
		material: null,
	});
	const rightWall = new Mesh({
		solid: false,
		geometry: rightWallGeometry,
		material: null,
	});
	const leftWall = new Mesh({
		solid: false,
		geometry: leftWallGeometry,
		material: null,
	});
	const shortBlock = new Mesh({
		solid: false,
		geometry: shortBlockGeometry,
		material: null,
	});
	const tallBlock = new Mesh({
		solid: false,
		geometry: tallBlockGeometry,
		material: null,
	});

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
		fieldOfView: 60,
		nearClipPlane: 0.01,
		farClipPlane: 2000,
	});

	camera.setAspectRatio(1);

	return camera;
}