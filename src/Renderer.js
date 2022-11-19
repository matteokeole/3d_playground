import {WINDOW} from "./constants.js";
import {Matrix4} from "./math/index.js";
import {linkProgram} from "./utils/index.js";

const
	canvas = document.createElement("canvas"),
	gl = canvas.getContext("webgl2"),
	init = async function() {
		canvas.width = innerWidth;
		canvas.height = innerHeight;

		document.body.appendChild(canvas);

		const program = await linkProgram(gl, [
			"main.vert",
			"main.frag",
		]);

		gl.useProgram(program);

		gl.attribute = {
			position: 0,
			uv: 1,
		};
		gl.uniform = {
			matrix: gl.getUniformLocation(program, "u_matrix"),
		};
		gl.buffer = {
			index: gl.createBuffer(),
			vertex: gl.createBuffer(),
			uv: gl.createBuffer(),
		};

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.enableVertexAttribArray(gl.attribute.uv);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
		gl.vertexAttribPointer(gl.attribute.position, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
		gl.vertexAttribPointer(gl.attribute.uv, 2, gl.FLOAT, true, 0, 0);

		gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
	},
	render = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;
		let mesh, worldMatrix, worldViewProjectionMatrix;

		const viewProjectionMatrix = camera.projectionMatrix
			.multiplyMatrix4(Matrix4.translation(camera.distance.invert()))
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			.multiplyMatrix4(Matrix4.rotationZ(camera.rotation.z))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		gl.clearColor(...scene.background);
		gl.clear(gl.COLOR_BUFFER_BIT);

		for (let i = 0; i < length; i++) {
			mesh = meshes[i];

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.geometry.indices, gl.STATIC_DRAW);

			worldMatrix = Matrix4.translation(mesh.position.multiply(camera.lhcs).invert())
				.multiplyMatrix4(Matrix4.rotationX(-mesh.rotation.x))
				.multiplyMatrix4(Matrix4.rotationY(mesh.rotation.y))
				.multiplyMatrix4(Matrix4.rotationZ(-mesh.rotation.z))
				.multiplyMatrix4(Matrix4.scale(mesh.scale));

			worldViewProjectionMatrix = viewProjectionMatrix.multiplyMatrix4(worldMatrix);

			gl.uniformMatrix4fv(gl.uniform.matrix, false, new Float32Array(worldViewProjectionMatrix));

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry.vertices, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.uv);
			gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry.uvs, gl.STATIC_DRAW);

			gl.bindTexture(gl.TEXTURE_2D, mesh.material.texture[0].texture);

			gl.drawElements(gl.TRIANGLES, mesh.geometry.indices.length, gl.UNSIGNED_BYTE, 0);
		}
	},
	resize = function() {
		canvas.width = WINDOW.width;
		canvas.height = WINDOW.height;
	},
	viewport = () => gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

canvas.addEventListener("click", function() {
	this.requestPointerLock();
});

export const Renderer = {canvas, gl, init, render, resize, viewport};