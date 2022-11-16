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
			position: gl.getAttribLocation(program, "a_position"),
		};
		gl.uniform = {
			matrix: gl.getUniformLocation(program, "u_matrix"),
		};
		gl.buffer = {
			position: gl.createBuffer(),
			index: gl.createBuffer(),
		};

		gl.bindVertexArray(gl.vao = gl.createVertexArray());

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
		gl.vertexAttribPointer(gl.attribute.buffer, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.buffer.index);

		gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
	},
	render = function(scene, camera) {
		const
			meshes = [...scene.meshes],
			{length} = meshes;
		let mesh, worldMatrix, worldViewProjectionMatrix;

		const viewProjectionMatrix = camera.projectionMatrix
			.multiplyMatrix4(Matrix4.rotationX(-camera.rotation.x))
			.multiplyMatrix4(Matrix4.rotationY(camera.rotation.y))
			.multiplyMatrix4(Matrix4.translation(camera.position.multiply(camera.lhcs)));

		for (let i = 0; i < length; i++) {
			mesh = meshes[i];

			worldMatrix = Matrix4
				.translation(mesh.position.multiply(camera.lhcs).invert())
				.multiplyMatrix4(Matrix4.scale(mesh.scale));

			worldViewProjectionMatrix = viewProjectionMatrix
				.multiplyMatrix4(worldMatrix);

			gl.uniformMatrix4fv(gl.uniform.matrix, false, worldViewProjectionMatrix);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
			gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry.vertices, gl.STATIC_DRAW);

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.geometry.indices, gl.STATIC_DRAW);

			gl.drawElements(gl.TRIANGLES, mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
		}
	};

export const Renderer = {canvas, gl, init, render};