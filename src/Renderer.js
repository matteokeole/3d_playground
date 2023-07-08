import {keys} from "../public/constants.js";
import {Matrix4} from "./math/index.js";
import {createProgram, linkProgram} from "./utils/index.js";

let canvas, gl, camera, crosshair;

const getCanvas = () => canvas;
const getContext = () => gl;
const bindCamera = newCamera => camera = newCamera;
const bindCrosshair = newCrosshair => crosshair = newCrosshair;

function build() {
	canvas = document.createElement("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	gl = canvas.getContext("webgl2");

	if (!gl) throw new NoWebGL2Error();

	document.body.appendChild(canvas);
}

async function init() {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // GUI transparency

	gl.bindTexture(gl.TEXTURE_2D, gl.guiTexture = gl.createTexture());
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Don't generate mipmaps

	const [program, vertexShader, fragmentShader] = await createProgram(gl, [
		"main.vert",
		"main.frag",
	]);

	linkProgram(gl, program, vertexShader, fragmentShader);

	gl.attribute = {
		vertex: 0,
		world: 1,
		normal: 5,
		uv: 6,
	};
	gl.uniform = {
		projectionMatrix: gl.getUniformLocation(program, "u_projection"),
		cameraMatrix: gl.getUniformLocation(program, "u_camera"),
		lightDirection: gl.getUniformLocation(program, "u_light_direction"),
		lightColor: gl.getUniformLocation(program, "u_light_color"),
		lightIntensity: gl.getUniformLocation(program, "u_light_intensity"),
	};
	gl.buffer = {
		index: gl.createBuffer(),
		vertex: gl.createBuffer(),
		normal: gl.createBuffer(),
		uv: gl.createBuffer(),
		world: gl.createBuffer(),
	};
	gl.program = {
		scene: program,
	};
	gl.vao = {
		instancing: gl.createVertexArray(),
	};

	const
		lookAround = ({movementX: x, movementY: y}) => camera.lookAround(x, y),
		pressKeys = ({code}) => keys.add(code),
		releaseKeys = ({code}) => keys.delete(code);

	canvas.addEventListener("click", canvas.requestPointerLock);

	document.addEventListener("pointerlockchange", function() {
		if (canvas === document.pointerLockElement) {
			addEventListener("mousemove", lookAround);
			addEventListener("keydown", pressKeys);
			addEventListener("keyup", releaseKeys);
		} else {
			removeEventListener("mousemove", lookAround);
			removeEventListener("keydown", pressKeys);
			removeEventListener("keyup", releaseKeys);

			keys.clear();
		}
	});
}

function prepareRender(scene, camera) {
	const
		meshes = [...scene.meshes],
		{length} = meshes;
	let i, j, loc, mesh;

	gl.useProgram(gl.program.scene);

	gl.bindVertexArray(gl.vao.instancing);

	gl.enableVertexAttribArray(gl.attribute.vertex);
	gl.enableVertexAttribArray(gl.attribute.normal);
	gl.enableVertexAttribArray(gl.attribute.uv);
	gl.enableVertexAttribArray(gl.attribute.world);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
	gl.vertexAttribPointer(gl.attribute.vertex, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.normal);
	gl.vertexAttribPointer(gl.attribute.normal, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
	gl.vertexAttribPointer(gl.attribute.uv, 2, gl.FLOAT, true, 0, 0);

	gl.worldData = new Float32Array(length * 16);
	gl.worldMatrices = [];

	for (i = 0; i < length; i++) {
		gl.worldMatrices.push(new Float32Array(
			gl.worldData.buffer,
			i * 64,
			16,
		));

		mesh = meshes[i];

		const position = mesh.position.clone().multiply(camera.lhcs).multiplyScalar(-1);
		const world = Matrix4.translation(position)
			.multiply(Matrix4.scale(mesh.scale));

		for (j = 0; j < 16; j++) gl.worldMatrices[i][j] = world[j];
	}

	// Allocate space on the matrix buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.world);
	gl.bufferData(gl.ARRAY_BUFFER, gl.worldData.byteLength, gl.DYNAMIC_DRAW);

	for (i = 0; i < 4; i++) {
		loc = gl.attribute.world + i;

		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
		gl.vertexAttribDivisor(loc, 1);
	}

	gl.uniformMatrix4fv(gl.uniform.projectionMatrix, false, camera.projectionMatrix);
	gl.uniform3fv(gl.uniform.lightDirection, scene.directionalLight.direction);
	gl.uniform3fv(gl.uniform.lightColor, scene.directionalLight.color.normalized.splice(0, 3));
	gl.uniform1f(gl.uniform.lightIntensity, scene.directionalLight.intensity);

	/**
	 * @test Draw inverted crosshair
	 */
	// gl.bindTexture(gl.TEXTURE_2D, gl.white = gl.createTexture());
	// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
	// gl.generateMipmap(gl.TEXTURE_2D);
}

/**
 * @param {Scene} scene
 * @param {Camera} camera
 */
function render(scene, camera) {
	gl.clearColor(...scene.background);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(gl.program.scene);
	gl.bindVertexArray(gl.vao.instancing);

	// Draw scene
	{
		const
			meshes = [...scene.meshes],
			firstMesh = meshes[0],
			{length} = meshes;

		const cameraMatrix = Matrix4
			.translation(camera.distance.clone().multiplyScalar(-1))
			.multiply(Matrix4.rotation(camera.rotation))
			.multiply(Matrix4.translation(camera.position.clone().multiply(camera.lhcs)));

		/** @todo Switch to a matrix attribute */
		gl.uniformMatrix4fv(gl.uniform.cameraMatrix, false, cameraMatrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.world);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl.worldData);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, firstMesh.geometry.indices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.normals, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.uvs, gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, firstMesh.material.texture);

		gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, length);
	}
}

export const Renderer = {build, getCanvas, getContext, bindCamera, bindCrosshair, init, prepareRender, render};