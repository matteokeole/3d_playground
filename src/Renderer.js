import {WINDOW} from "../public/constants.js";
import {Matrix4} from "./math/index.js";
import {createProgram, linkProgram} from "./utils/index.js";

const
	canvas = document.createElement("canvas"),
	gl = canvas.getContext("webgl2"),
	init = async function() {
		canvas.width = innerWidth;
		canvas.height = innerHeight;

		document.body.appendChild(canvas);

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.DEPTH_TEST);
		/** @todo Minimize the number of faces to render */
		gl.enable(gl.CULL_FACE);

		const [program, vertexShader, fragmentShader] = await createProgram(gl, [
			"main.vert",
			"main.frag",
		]);

		linkProgram(gl, program, vertexShader, fragmentShader);

		gl.useProgram(program);

		gl.attribute = {
			position: 0,
			normal: 1,
			uv: 2,
			worldMatrix: 3,
		};
		gl.uniform = {
			projectionMatrix: gl.getUniformLocation(program, "u_projection"),
			cameraMatrix: gl.getUniformLocation(program, "u_camera"),
			lightDirection: gl.getUniformLocation(program, "u_lightDirection"),
			lightColor: gl.getUniformLocation(program, "u_lightColor"),
			lightIntensity: gl.getUniformLocation(program, "u_lightIntensity"),
		};
		gl.buffer = {
			index: gl.createBuffer(),
			position: gl.createBuffer(),
			normal: gl.createBuffer(),
			uv: gl.createBuffer(),
			worldMatrix: gl.createBuffer(),
		};
		gl.vao = gl.createVertexArray();

		gl.bindVertexArray(gl.vao);

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
	},
	prepareRender = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			firstMesh = meshes[0],
			{length} = meshes;
		let i, j, loc, mesh;

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

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, firstMesh.geometry.indices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.normals, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.uvs, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.worldMatrix);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl.worldMatrixData);

		gl.bindTexture(gl.TEXTURE_2D, firstMesh.material.texture.texture);
	},
	render = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;

		gl.clearColor(...scene.background);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const cameraMatrix = Matrix4.translation(camera.distance.invert())
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			// .multiplyMatrix4(Matrix4.rotationZ(camera.rotation.z))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		gl.uniformMatrix4fv(gl.uniform.cameraMatrix, false, new Float32Array(cameraMatrix));

		gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, length);
	},
	resize = () => gl.viewport(0, 0, WINDOW.width, WINDOW.height);

canvas.addEventListener("click", canvas.requestPointerLock);

export const Renderer = {canvas, gl, init, prepareRender, render, resize};