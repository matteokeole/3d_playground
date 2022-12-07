import {keys, TEXTURES} from "../public/constants.js";
import {Matrix4} from "./math/index.js";
import {createProgram, linkProgram} from "./utils/index.js";
import {NoWebGL2Error} from "./errors/NoWebGL2Error.js";

const getCanvas = () => canvas;
const getContext = () => gl;
let canvas, gl;

function build() {
	canvas = document.createElement("canvas");
	gl = canvas.getContext("webgl2");

	if (!gl) throw new NoWebGL2Error();

	document.body.appendChild(canvas);
	document.body.style.backgroundColor = "#000";
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

	const [guiProgram, guiVertexShader, guiFragmentShader] = await createProgram(gl, [
		"gui.vert",
		"gui.frag",
	]);

	linkProgram(gl, program, vertexShader, fragmentShader);
	linkProgram(gl, guiProgram, guiVertexShader, guiFragmentShader);

	gl.attribute = {
		position: 0,
		normal: 1,
		uv: 2,
		worldMatrix: 3,
		guiPosition: 0,
	};
	gl.uniform = {
		projectionMatrix: gl.getUniformLocation(program, "u_projection"),
		cameraMatrix: gl.getUniformLocation(program, "u_camera"),
		lightDirection: gl.getUniformLocation(program, "u_lightDirection"),
		lightColor: gl.getUniformLocation(program, "u_lightColor"),
		lightIntensity: gl.getUniformLocation(program, "u_lightIntensity"),
		resolution: null,
	};
	gl.buffer = {
		index: gl.createBuffer(),
		position: gl.createBuffer(),
		normal: gl.createBuffer(),
		uv: gl.createBuffer(),
		worldMatrix: gl.createBuffer(),
		guiPosition: gl.createBuffer(),
	};
	gl.program = {
		scene: program,
		gui: guiProgram,
	};
	gl.vao = {
		instancing: gl.createVertexArray(),
		gui: gl.createVertexArray(),
	};

	try {
		resizeObserver.observe(canvas, {
			box: "device-pixel-content-box",
		});
	} catch (error) {
		resizeObserver.observe(canvas, {
			box: "content-box",
		});
	}

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

const bindCamera = newCamera => camera = newCamera;

function prepareRender(scene, camera) {
	const
		meshes = [...scene.meshes],
		{length} = meshes;
	let i, j, loc, mesh;

	gl.useProgram(gl.program.scene);

	gl.bindVertexArray(gl.vao.instancing);

	gl.enableVertexAttribArray(gl.attribute.position);
	gl.enableVertexAttribArray(gl.attribute.normal);
	gl.enableVertexAttribArray(gl.attribute.uv);
	gl.enableVertexAttribArray(gl.attribute.worldMatrix);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
	gl.vertexAttribPointer(gl.attribute.position, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.normal);
	gl.vertexAttribPointer(gl.attribute.normal, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
	gl.vertexAttribPointer(gl.attribute.uv, 2, gl.FLOAT, true, 0, 0);

	gl.worldMatrixData = new Float32Array(length * 16);
	gl.worldMatrices = [];

	for (i = 0; i < length; i++) {
		gl.worldMatrices.push(new Float32Array(
			gl.worldMatrixData.buffer,
			i * 64,
			16,
		));

		mesh = meshes[i];

		const position = mesh.position.multiply(camera.lhcs).invert();
		const worldMatrix = Matrix4.translation(position)
			.multiplyMatrix4(Matrix4.scale(mesh.scale));

		for (j = 0; j < 16; j++) gl.worldMatrices[i][j] = worldMatrix[j];
	}

	// Allocate space on the matrix buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.worldMatrix);
	gl.bufferData(gl.ARRAY_BUFFER, gl.worldMatrixData.byteLength, gl.DYNAMIC_DRAW);

	for (i = 0; i < 4; i++) {
		loc = gl.attribute.worldMatrix + i;

		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
		gl.vertexAttribDivisor(loc, 1);
	}

	gl.uniformMatrix4fv(gl.uniform.projectionMatrix, false, new Float32Array(camera.projectionMatrix));
	gl.uniform3f(gl.uniform.lightDirection, ...scene.directionalLight.direction.toArray());
	gl.uniform3f(gl.uniform.lightColor, ...scene.directionalLight.color.normalized);
	gl.uniform1f(gl.uniform.lightIntensity, scene.directionalLight.intensity);

	// Configure GUI VAO

	gl.bindVertexArray(gl.vao.gui);

	gl.useProgram(gl.program.gui);

	gl.enableVertexAttribArray(gl.attribute.guiPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.guiPosition);
	gl.vertexAttribPointer(gl.attribute.guiPosition, 2, gl.FLOAT, false, 0, 0);

	gl.uniform.resolution = gl.getUniformLocation(gl.program.gui, "u_resolution");

	/**
	 * @test Draw inverted crosshair
	 */
	gl.bindTexture(gl.TEXTURE_2D, gl.white = gl.createTexture());
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
	gl.generateMipmap(gl.TEXTURE_2D);
}

/**
 * Renders a frame.
 * 
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

		const cameraMatrix = Matrix4.translation(camera.distance.invert())
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			.multiplyMatrix4(Matrix4.rotationZ(camera.rotation.z))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		/** @todo Switch to a matrix attribute */
		gl.uniformMatrix4fv(gl.uniform.cameraMatrix, false, new Float32Array(cameraMatrix));

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.worldMatrix);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl.worldMatrixData);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, firstMesh.geometry.indices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.normals, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.uvs, gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, firstMesh.material.texture);

		gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, length);
	}

	gl.useProgram(gl.program.gui);
	gl.bindVertexArray(gl.vao.gui);

	/**
	 * @todo Draw inverted crosshair
	 */
	{
		gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ONE_MINUS_SRC_COLOR);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.guiPosition);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			 9,  9,
			-9,  9,
			-9, -9,
			 9, -9,
		]), gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, gl.white);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	// Draw GUI
	{
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		return;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			 1,  1,
			-1,  1,
			-1, -1,
			 1, -1,
		]), gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, gl.guiTexture);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
}

let camera;

const resizeObserver = new ResizeObserver(function([entry]) {
	const canvas = entry.target;
	let width, height, dpr = 1;

	if (entry.devicePixelContentBoxSize) {
		({inlineSize: width, blockSize: height} = entry.devicePixelContentBoxSize[0]);
	} else {
		dpr = devicePixelRatio;

		if (entry.contentBoxSize) {
			if (entry.contentBoxSize[0]) {
				({inlineSize: width, blockSize: height} = entry.contentBoxSize[0]);
			} else {
				({inlineSize: width, blockSize: height} = entry.contentBoxSize);
			}
		} else {
			({width, height} = entry.contentRect);
		}
	}

	canvas.width = width * dpr | 0;
	canvas.height = height * dpr | 0;

	camera.aspect = canvas.width / canvas.height;
	camera.updateProjectionMatrix();

	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.useProgram(gl.program.scene);
	gl.uniformMatrix4fv(gl.uniform.projectionMatrix, false, new Float32Array(camera.projectionMatrix));

	gl.useProgram(gl.program.gui);
	gl.uniform2f(gl.uniform.resolution, canvas.width, canvas.height);
});

export const Renderer = {build, getCanvas, getContext, bindCamera, init, prepareRender, render};