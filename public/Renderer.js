import {AbstractRenderer} from "src";
import {Matrix4} from "src/math";

export class Renderer extends AbstractRenderer {
	async build() {
		super.build();

		this.createProgram(
			"gBuffer",
			await (await fetch("assets/shaders/gBuffer.vert")).text(),
			await (await fetch("assets/shaders/gBuffer.frag")).text(),
		);

		this.createProgram(
			"screen",
			await (await fetch("assets/shaders/screen.vert")).text(),
			await (await fetch("assets/shaders/screen.frag")).text(),
		);

		const gl = this.gl;
		const programs = this.programs;
		const vaos = this.vaos;
		const buffers = this.buffers;
		const uniforms = this.uniforms;

		gl.frontFace(gl.CW);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		vaos.gBuffer = gl.createVertexArray();
		vaos.screen = gl.createVertexArray();

		gl.useProgram(programs.gBuffer);
		gl.bindVertexArray(vaos.gBuffer);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(5);
		gl.enableVertexAttribArray(6);

		uniforms.projection = gl.getUniformLocation(programs.gBuffer, "u_projection");
		uniforms.view = gl.getUniformLocation(programs.gBuffer, "u_view");
		uniforms.lightDirection = gl.getUniformLocation(programs.gBuffer, "u_light_direction");
		uniforms.lightColor = gl.getUniformLocation(programs.gBuffer, "u_light_color");
		uniforms.lightIntensity = gl.getUniformLocation(programs.gBuffer, "u_light_intensity");

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

		this.buildGBuffer();

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	buildGBuffer() {
		const gl = this.gl;

		this.gBuffer = {
			framebuffer: gl.createFramebuffer(),
			position: this.buildGBufferTexture(),
			normal: this.buildGBufferTexture(),
			color: this.buildGBufferTexture(),
			depth: this.buildGBufferDepthTexture(),
			depthRGB: this.buildGBufferTexture(),
		};

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.gBuffer.position, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.gBuffer.normal, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.gBuffer.color, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, this.gBuffer.depthRGB, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.gBuffer.depth, 0);
		gl.drawBuffers([
			gl.COLOR_ATTACHMENT0,
			gl.COLOR_ATTACHMENT1,
			gl.COLOR_ATTACHMENT2,
			gl.COLOR_ATTACHMENT3,
		]);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw Error("Invalid framebuffer.");

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	buildGBufferTexture() {
		const gl = this.gl;
		const viewport = this.viewport;

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA8,
			viewport[2],
			viewport[3],
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		return texture;
	}

	buildGBufferDepthTexture() {
		const gl = this.gl;
		const viewport = this.viewport;

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.DEPTH_COMPONENT24,
			viewport[2],
			viewport[3],
			0,
			gl.DEPTH_COMPONENT,
			gl.UNSIGNED_INT,
			null,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		return texture;
	}

	prerender() {
		const gl = this.gl;
		const programs = this.programs;
		const vaos = this.vaos;
		const buffers = this.buffers;
		const uniforms = this.uniforms;
		const scene = this.scene;
		const directionalLight = scene.directionalLight;
		const meshes = scene.meshes;
		const length = meshes.length;

		gl.useProgram(programs.gBuffer);
		gl.bindVertexArray(vaos.gBuffer);

		gl.uniform3fv(uniforms.lightDirection, directionalLight.direction.clone().multiplyScalar(-1));
		gl.uniform3fv(uniforms.lightColor, directionalLight.color);
		gl.uniform1f(uniforms.lightIntensity, directionalLight.intensity);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.world);
		const worlds = new Float32Array(length * 16);
		for (let i = 0, mesh; i < length; i++) {
			mesh = meshes[i];

			const translation = Matrix4.translation(mesh.position);
			const scale = Matrix4.scale(mesh.scale);
			const world = translation.multiply(scale);

			worlds.set(world, i * 16);
		}
		gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW);

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
		const meshes = scene.meshes;
		const camera = this.camera;

		// G-Buffer
		{
			gl.useProgram(programs.gBuffer);
			gl.bindVertexArray(vaos.gBuffer);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.framebuffer);

			gl.clearColor(...scene.background);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.uniformMatrix4fv(uniforms.projection, false, camera.projection);
			gl.uniformMatrix4fv(uniforms.view, false, camera.view);

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshes[0].geometry.indices, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, meshes[0].geometry.vertices, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, meshes[0].geometry.normals, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
			gl.bufferData(gl.ARRAY_BUFFER, meshes[0].geometry.uvs, gl.STATIC_DRAW);

			gl.bindTexture(gl.TEXTURE_2D, meshes[0].material.texture);

			gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, meshes.length);

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		gl.enable(gl.SCISSOR_TEST);
		gl.useProgram(programs.screen);
		gl.bindVertexArray(vaos.screen);

		const viewportHalf = this.viewport.clone().multiplyScalar(.5);

		// Position
		{
			gl.scissor(0, viewportHalf[3], viewportHalf[2], viewportHalf[3]);

			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.position);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		// Normal
		{
			gl.scissor(viewportHalf[2], viewportHalf[3], viewportHalf[2], viewportHalf[3]);

			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.normal);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		// Color
		{
			gl.scissor(0, 0, viewportHalf[2], viewportHalf[3]);

			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.color);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		// Depth
		{
			gl.scissor(viewportHalf[2], 0, viewportHalf[2], viewportHalf[3]);

			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.depthRGB);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		gl.bindVertexArray(null);
		gl.useProgram(null);
		gl.disable(gl.SCISSOR_TEST);
	}
}