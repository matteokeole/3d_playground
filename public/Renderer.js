import {AbstractRenderer} from "../src/index.js";
import {Matrix4} from "../src/math/index.js";

export class Renderer extends AbstractRenderer {
	async build() {
		super.build();

		this.createProgram(
			"main",
			await (await fetch("assets/shaders/main.vert")).text(),
			await (await fetch("assets/shaders/main.frag")).text(),
		);

		const gl = this.gl;
		const programs = this.programs;
		const vaos = this.vaos;
		const buffers = this.buffers;
		const uniforms = this.uniforms;

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		vaos.main = gl.createVertexArray();

		gl.useProgram(programs.main);
		gl.bindVertexArray(vaos.main);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(5);
		gl.enableVertexAttribArray(6);

		uniforms.projection = gl.getUniformLocation(programs.main, "u_projection");
		uniforms.view = gl.getUniformLocation(programs.main, "u_view");
		uniforms.lightDirection = gl.getUniformLocation(programs.main, "u_light_direction");
		uniforms.lightColor = gl.getUniformLocation(programs.main, "u_light_color");
		uniforms.lightIntensity = gl.getUniformLocation(programs.main, "u_light_intensity");

		buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

		buffers.vertex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		buffers.world = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);
		for (let i = 0, index = 1; i < 4; i++, index++) {
			gl.enableVertexAttribArray(index);
			gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 64, i * 16);
			gl.vertexAttribDivisor(index, 1);
		}

		buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.vertexAttribPointer(5, 3, gl.FLOAT, false, 0, 0); // Normalize?

		buffers.uv = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
		gl.vertexAttribPointer(6, 2, gl.FLOAT, true, 0, 0);

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	render() {
		super.render();

		const gl = this.gl;
		const programs = this.programs;
		const vaos = this.vaos;
		const buffers = this.buffers;
		const uniforms = this.uniforms;
		const scene = this.scene;
		const camera = this.camera;

		gl.clearColor(...scene.background);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(programs.main);
		gl.bindVertexArray(vaos.main);

		gl.uniformMatrix4fv(uniforms.projection, false, camera.projectionMatrix);
		gl.uniform3fv(uniforms.lightDirection, scene.directionalLight.direction);
		gl.uniform3fv(uniforms.lightColor, scene.directionalLight.color.normalized.splice(0, 3));
		gl.uniform1f(uniforms.lightIntensity, scene.directionalLight.intensity);

		const meshes = scene.meshes;
		const length = meshes.length;
		const firstMesh = meshes[0];

		const view = Matrix4
			.translation(camera.distance.clone().multiplyScalar(-1))
			.multiply(Matrix4.rotation(camera.rotation))
			.multiply(Matrix4.translation(camera.position.clone().multiply(camera.lhcs)));

		/** @todo Switch to a matrix attribute */
		gl.uniformMatrix4fv(uniforms.view, false, view);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, firstMesh.geometry.indices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);
		const worlds = new Float32Array(length * 16);
		for (let i = 0, mesh; i < length; i++) {
			mesh = meshes[i];

			const position = mesh.position.clone().multiply(camera.lhcs).multiplyScalar(-1);
			const translation = Matrix4.translation(position);
			const scale = Matrix4.scale(mesh.scale);
			const world = translation.multiply(scale);

			worlds.set(world, i * 16);
		}
		gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.normals, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
		gl.bufferData(gl.ARRAY_BUFFER, firstMesh.geometry.uvs, gl.STATIC_DRAW);

		gl.bindTexture(gl.TEXTURE_2D, firstMesh.material.texture);

		gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, length);
	}
}