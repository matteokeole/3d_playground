import {AbstractRenderer} from "../../src/index.js";
import {Matrix4} from "../../src/math/index.js";

export class Renderer extends AbstractRenderer {
	async build() {
		super.build();

		this.createProgram(
			"gBuffer",
			await (await fetch("public/minecraft/shaders/g_buffer.vert")).text(),
			await (await fetch("public/minecraft/shaders/g_buffer.frag")).text(),
		);

		this.createProgram(
			"screen",
			await (await fetch("public/minecraft/shaders/screen.vert")).text(),
			await (await fetch("public/minecraft/shaders/screen.frag")).text(),
		);

		this.createProgram(
			"lighting",
			await (await fetch("public/minecraft/shaders/lighting.vert")).text(),
			await (await fetch("public/minecraft/shaders/lighting.frag")).text(),
		);

		this._context.frontFace(this._context.CW);
		this._context.pixelStorei(this._context.UNPACK_FLIP_Y_WEBGL, true);
		this._context.enable(this._context.CULL_FACE);
		this._context.enable(this._context.DEPTH_TEST);
		this._context.depthFunc(this._context.LEQUAL);

		this._vaos.gBuffer = this._context.createVertexArray();
		this._vaos.screen = this._context.createVertexArray();
		this._vaos.lighting = this._context.createVertexArray();

		this._context.useProgram(this._programs.gBuffer);
		this._context.bindVertexArray(this._vaos.gBuffer);

		this._context.enableVertexAttribArray(0);
		this._context.enableVertexAttribArray(1);
		this._context.enableVertexAttribArray(5);
		this._context.enableVertexAttribArray(6);

		this._uniforms.projection = this._context.getUniformLocation(this._programs.gBuffer, "u_projection");
		this._uniforms.view = this._context.getUniformLocation(this._programs.gBuffer, "u_view");

		this._buffers.index = this._context.createBuffer();
		this._context.bindBuffer(this._context.ELEMENT_ARRAY_BUFFER, this._buffers.index);

		this._buffers.vertex = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
		this._context.vertexAttribPointer(0, 3, this._context.FLOAT, false, 0, 0);

		this._buffers.world = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.world);
		for (let i = 0, index = 1; i < 4; i++, index++) {
			this._context.enableVertexAttribArray(index);
			this._context.vertexAttribPointer(index, 4, this._context.FLOAT, false, 64, i * 16);
			this._context.vertexAttribDivisor(index, 1);
		}

		this._buffers.normal = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.normal);
		this._context.vertexAttribPointer(5, 3, this._context.FLOAT, false, 0, 0); // Normalize?

		this._buffers.uv = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.uv);
		this._context.vertexAttribPointer(6, 2, this._context.FLOAT, true, 0, 0);

		this.buildGBuffer();

		this._context.useProgram(this._programs.lighting);
		this._context.bindVertexArray(this._vaos.lighting);

		this._uniforms.positionSampler = this._context.getUniformLocation(this._programs.lighting, "u_position_sampler");
		this._uniforms.normalSampler = this._context.getUniformLocation(this._programs.lighting, "u_normal_sampler");
		this._uniforms.colorSampler = this._context.getUniformLocation(this._programs.lighting, "u_color_sampler");
		this._uniforms.depthSampler = this._context.getUniformLocation(this._programs.lighting, "u_depth_sampler");
		this._uniforms.lightDirection = this._context.getUniformLocation(this._programs.lighting, "u_light_direction");
		this._uniforms.lightColor = this._context.getUniformLocation(this._programs.lighting, "u_light_color");
		this._uniforms.lightIntensity = this._context.getUniformLocation(this._programs.lighting, "u_light_intensity");

		this._context.bindVertexArray(null);
		this._context.useProgram(null);
	}

	buildGBuffer() {
		this.gBuffer = {
			framebuffer: this._context.createFramebuffer(),
			position: this.buildGBufferTexture(),
			normal: this.buildGBufferTexture(),
			color: this.buildGBufferTexture(),
			depth: this.buildGBufferDepthTexture(),
			depthRGB: this.buildGBufferTexture(),
		};

		this._context.bindFramebuffer(this._context.FRAMEBUFFER, this.gBuffer.framebuffer);
		this._context.framebufferTexture2D(this._context.FRAMEBUFFER, this._context.COLOR_ATTACHMENT0, this._context.TEXTURE_2D, this.gBuffer.position, 0);
		this._context.framebufferTexture2D(this._context.FRAMEBUFFER, this._context.COLOR_ATTACHMENT1, this._context.TEXTURE_2D, this.gBuffer.normal, 0);
		this._context.framebufferTexture2D(this._context.FRAMEBUFFER, this._context.COLOR_ATTACHMENT2, this._context.TEXTURE_2D, this.gBuffer.color, 0);
		this._context.framebufferTexture2D(this._context.FRAMEBUFFER, this._context.COLOR_ATTACHMENT3, this._context.TEXTURE_2D, this.gBuffer.depthRGB, 0);
		this._context.framebufferTexture2D(this._context.FRAMEBUFFER, this._context.DEPTH_ATTACHMENT, this._context.TEXTURE_2D, this.gBuffer.depth, 0);
		this._context.drawBuffers([
			this._context.COLOR_ATTACHMENT0,
			this._context.COLOR_ATTACHMENT1,
			this._context.COLOR_ATTACHMENT2,
			this._context.COLOR_ATTACHMENT3,
		]);

		if (this._context.checkFramebufferStatus(this._context.FRAMEBUFFER) !== this._context.FRAMEBUFFER_COMPLETE) throw Error("Invalid framebuffer.");

		this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
	}

	buildGBufferTexture() {
		const texture = this._context.createTexture();
		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this._context.texImage2D(
			this._context.TEXTURE_2D,
			0,
			this._context.RGBA8,
			this._viewport[2],
			this._viewport[3],
			0,
			this._context.RGBA,
			this._context.UNSIGNED_BYTE,
			null,
		);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);

		return texture;
	}

	buildGBufferDepthTexture() {
		const texture = this._context.createTexture();
		this._context.bindTexture(this._context.TEXTURE_2D, texture);
		this._context.texImage2D(
			this._context.TEXTURE_2D,
			0,
			this._context.DEPTH_COMPONENT24,
			this._viewport[2],
			this._viewport[3],
			0,
			this._context.DEPTH_COMPONENT,
			this._context.UNSIGNED_INT,
			null,
		);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.NEAREST);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);

		return texture;
	}

	setupTexture(image) {
		this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGB, this._context.RGB, this._context.UNSIGNED_BYTE, image);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
		this._context.generateMipmap(this._context.TEXTURE_2D);
	}

	prerender() {
		const {scene} = this;
		const {meshes, lights} = scene;
		const {length} = meshes;

		this._context.useProgram(this._programs.gBuffer);
		this._context.bindVertexArray(this._vaos.gBuffer);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.world);
		const worlds = new Float32Array(length * 16);
		for (let i = 0, mesh; i < length; i++) {
			mesh = meshes[i];

			const translation = Matrix4.translation(mesh.position);
			const scale = Matrix4.scale(mesh.scale);
			const world = translation.multiply(scale);

			worlds.set(world, i * 16);
		}
		this._context.bufferData(this._context.ARRAY_BUFFER, worlds, this._context.STATIC_DRAW);

		this._context.useProgram(this._programs.lighting);
		this._context.bindVertexArray(this._vaos.lighting);

		this._context.uniform1i(this._uniforms.positionSampler, 0);
		this._context.uniform1i(this._uniforms.normalSampler, 1);
		this._context.uniform1i(this._uniforms.colorSampler, 2);
		this._context.uniform1i(this._uniforms.depthSampler, 3);
		this._context.uniform3fv(this._uniforms.lightDirection, lights[0].direction.clone().multiplyScalar(-1));
		this._context.uniform3fv(this._uniforms.lightColor, lights[0].color);
		this._context.uniform1f(this._uniforms.lightIntensity, lights[0].intensity);

		this._context.bindVertexArray(null);
		this._context.useProgram(null);
	}

	render() {
		super.render();

		const {scene, camera} = this;
		const viewportHalf = this._viewport.clone().divideScalar(2);
		const {meshes} = scene;

		// G-Buffer
		{
			this._context.useProgram(this._programs.gBuffer);
			this._context.bindVertexArray(this._vaos.gBuffer);
			this._context.bindFramebuffer(this._context.FRAMEBUFFER, this.gBuffer.framebuffer);

			this._context.clearColor(...scene.background);
			this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);

			this._context.uniformMatrix4fv(this._uniforms.projection, false, camera.projection);
			this._context.uniformMatrix4fv(this._uniforms.view, false, camera.view);

			this._context.bufferData(this._context.ELEMENT_ARRAY_BUFFER, meshes[0].geometry.indices, this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
			this._context.bufferData(this._context.ARRAY_BUFFER, meshes[0].geometry.vertices, this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.normal);
			this._context.bufferData(this._context.ARRAY_BUFFER, meshes[0].geometry.normals, this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.uv);
			this._context.bufferData(this._context.ARRAY_BUFFER, meshes[0].geometry.uvs, this._context.STATIC_DRAW);

			this._context.bindTexture(this._context.TEXTURE_2D, meshes[0].material.texture.texture);

			this._context.drawElementsInstanced(this._context.TRIANGLES, 36, this._context.UNSIGNED_BYTE, 0, meshes.length);

			this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
		}

		if (this.debug) {
			this._context.enable(this._context.SCISSOR_TEST);
			this._context.useProgram(this._programs.screen);
			this._context.bindVertexArray(this._vaos.screen);

			// Position
			{
				this._context.scissor(0, viewportHalf[3], viewportHalf[2], viewportHalf[3]);

				this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.position);

				this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
			}

			// Normal
			{
				this._context.scissor(viewportHalf[2], viewportHalf[3], viewportHalf[2], viewportHalf[3]);

				this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.normal);

				this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
			}

			// Color
			{
				this._context.scissor(0, 0, viewportHalf[2], viewportHalf[3]);

				this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.color);

				this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
			}

			// Depth
			{
				this._context.scissor(viewportHalf[2], 0, viewportHalf[2], viewportHalf[3]);

				this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.depthRGB);

				this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
			}

			this._context.disable(this._context.SCISSOR_TEST);
		} else {
			this._context.useProgram(this._programs.lighting);
			this._context.bindVertexArray(this._vaos.lighting);

			this._context.activeTexture(this._context.TEXTURE0);
			this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.position);
			this._context.activeTexture(this._context.TEXTURE1);
			this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.normal);
			this._context.activeTexture(this._context.TEXTURE2);
			this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.color);
			this._context.activeTexture(this._context.TEXTURE3);
			this._context.bindTexture(this._context.TEXTURE_2D, this.gBuffer.depthRGB);

			this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);

			this._context.bindTexture(this._context.TEXTURE_2D, null);
			this._context.activeTexture(this._context.TEXTURE2);
			this._context.bindTexture(this._context.TEXTURE_2D, null);
			this._context.activeTexture(this._context.TEXTURE1);
			this._context.bindTexture(this._context.TEXTURE_2D, null);
			this._context.activeTexture(this._context.TEXTURE0);
			this._context.bindTexture(this._context.TEXTURE_2D, null);
		}

		this._context.bindVertexArray(null);
		this._context.useProgram(null);
	}
}