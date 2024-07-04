import {WebGLRenderer} from "../../src/Renderer/index.js";
import {Matrix4, Vector4} from "../../src/math/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";

export class Renderer extends WebGLRenderer {
	/**
	 * @type {WebGLTexture[]}
	 */
	#textures;

	async build() {
		super.build();

		this.#textures = [];
		this.debug = false;

		await this.#loadShaders();

		const gl = this._context;

		gl.frontFace(gl.CW);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clearColor(.55, .62, .72, 1);

		// this._vaos.gBuffer = gl.createVertexArray();
		this._vaos.lightDepth = gl.createVertexArray();
		// this._vaos.final = gl.createVertexArray();
		this._vaos.shadow = gl.createVertexArray();

		/* gl.bindVertexArray(this._vaos.gBuffer);
			this._buffers.gBuffer_index = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.gBuffer_index);

			this._buffers.gBuffer_vertex = gl.createBuffer();
			gl.enableVertexAttribArray(0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_vertex);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

			this._buffers.gBuffer_world = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_world);
			for (let i = 0, index = 1; i < 4; i++, index++) {
				gl.enableVertexAttribArray(index);
				gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 64, i * 16);
				gl.vertexAttribDivisor(index, 1);
			}

			this._buffers.gBuffer_normal = gl.createBuffer();
			gl.enableVertexAttribArray(5);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_normal);
			gl.vertexAttribPointer(5, 3, gl.FLOAT, false, 0, 0);

			this._buffers.gBuffer_uv = gl.createBuffer();
			gl.enableVertexAttribArray(6);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_uv);
			gl.vertexAttribPointer(6, 2, gl.FLOAT, true, 0, 0);

			this._uniforms.gBuffer_cameraProjection = gl.getUniformLocation(this._programs.gBuffer, "u_camera.projection");
			this._uniforms.gBuffer_cameraView = gl.getUniformLocation(this._programs.gBuffer, "u_camera.view"); */
		gl.bindVertexArray(this._vaos.lightDepth);
			this._buffers.lightDepth_index = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.lightDepth_index);

			this._buffers.lightDepth_vertex = gl.createBuffer();
			gl.enableVertexAttribArray(0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.lightDepth_vertex);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

			this._buffers.lightDepth_world = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.lightDepth_world);
			for (let i = 0, index = 1; i < 4; i++, index++) {
				gl.enableVertexAttribArray(index);
				gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 64, i * 16);
				gl.vertexAttribDivisor(index, 1);
			}

			this._uniforms.lightDepth_lightViewProjection = gl.getUniformLocation(this._programs.lightDepth, "u_light.viewProjection");
		/* gl.bindVertexArray(this._vaos.final);
			this._uniforms.positionSampler = gl.getUniformLocation(this._programs.final, "u_position_sampler");
			this._uniforms.normalSampler = gl.getUniformLocation(this._programs.final, "u_normal_sampler");
			this._uniforms.colorSampler = gl.getUniformLocation(this._programs.final, "u_color_sampler");
			this._uniforms.depthSampler = gl.getUniformLocation(this._programs.final, "u_depth_sampler");
			this._uniforms.final_lightViewProjection = gl.getUniformLocation(this._programs.final, "u_light.viewProjection");
			this._uniforms.lightDirection = gl.getUniformLocation(this._programs.final, "u_light_direction");
			this._uniforms.lightColor = gl.getUniformLocation(this._programs.final, "u_light_color");
			this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.final, "u_light_intensity"); */
		gl.bindVertexArray(this._vaos.shadow);
			this._buffers.shadow_index = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.shadow_index);

			this._buffers.shadow_vertex = gl.createBuffer();
			gl.enableVertexAttribArray(0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_vertex);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

			this._buffers.shadow_world = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_world);
			for (let i = 0, index = 1; i < 4; i++, index++) {
				gl.enableVertexAttribArray(index);
				gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 64, i * 16);
				gl.vertexAttribDivisor(index, 1);
			}

			this._buffers.shadow_normal = gl.createBuffer();
			gl.enableVertexAttribArray(5);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_normal);
			gl.vertexAttribPointer(5, 3, gl.FLOAT, false, 0, 0);

			this._buffers.shadow_uv = gl.createBuffer();
			gl.enableVertexAttribArray(6);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_uv);
			gl.vertexAttribPointer(6, 2, gl.FLOAT, true, 0, 0);

			this._uniforms.shadow_cameraViewProjection = gl.getUniformLocation(this._programs.shadow, "u_camera.viewProjection");
			this._uniforms.shadow_cameraPosition = gl.getUniformLocation(this._programs.shadow, "u_camera.position");
			this._uniforms.shadow_lightViewProjection = gl.getUniformLocation(this._programs.shadow, "u_light.viewProjection");
			this._uniforms.shadow_lightPosition = gl.getUniformLocation(this._programs.shadow, "u_light.position");
			this._uniforms.depthSampler = gl.getUniformLocation(this._programs.shadow, "u_depthSampler");
			this._uniforms.albedoSampler = gl.getUniformLocation(this._programs.shadow, "u_albedoSampler");
		gl.bindVertexArray(null);

		// this.#createGBuffer();
		this.#createLightDepthFramebuffer();
	}

	/**
	 * @param {import("../../src/Loader/ImageBitmapLoader.js").Image[]} textureDescriptors
	 */
	loadTextures(textureDescriptors) {
		const gl = this._context;

		for (let i = 0; i < textureDescriptors.length; i++) {
			const textureDescriptor = textureDescriptors[i];
			const texture = gl.createTexture();

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textureDescriptor.bitmap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);

			this.#textures.push(texture);
		}
	}

	prerender() {
		const gl = this._context;
		const meshes = this._scene.getMeshes();
		const worlds = new Float32Array(meshes.length * 16);

		for (let i = 0, mesh; i < meshes.length; i++) {
			mesh = meshes[i];

			const world = Matrix4
				.translation(mesh.getPosition())
				.multiply(Matrix4.scale(mesh.scale));

			worlds.set(world, i * 16);
		}

		const pointLight = this._scene.getPointLight();
		const pointLightViewProjection = new Matrix4(pointLight.getProjection()).multiply(pointLight.getView());

		/* gl.bindVertexArray(this._vaos.gBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_world);
			gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW); */
		gl.bindVertexArray(this._vaos.lightDepth);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.lightDepth_world);
			gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW);

			gl.useProgram(this._programs.lightDepth);
				gl.uniformMatrix4fv(this._uniforms.lightDepth_lightViewProjection, false, pointLightViewProjection);
			gl.useProgram(null);
		/* gl.bindVertexArray(this._vaos.final);
			gl.useProgram(this._programs.final);
				gl.uniform1i(this._uniforms.positionSampler, 0);
				gl.uniform1i(this._uniforms.normalSampler, 1);
				gl.uniform1i(this._uniforms.colorSampler, 2);
				gl.uniform1i(this._uniforms.depthSampler, 3);
				gl.uniformMatrix4fv(this._uniforms.final_lightViewProjection, false, pointLightViewProjection);
				gl.uniform3fv(this._uniforms.lightDirection, new Vector3(-.8, -.2, .15).multiplyScalar(-1));
				gl.uniform3fv(this._uniforms.lightColor, new Vector3(1, 1, 1));
				gl.uniform1f(this._uniforms.lightIntensity, 1);
			gl.useProgram(null); */
		gl.bindVertexArray(this._vaos.shadow);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_world);
			gl.bufferData(gl.ARRAY_BUFFER, worlds, gl.STATIC_DRAW);

			gl.useProgram(this._programs.shadow);
				gl.uniformMatrix4fv(this._uniforms.shadow_lightViewProjection, false, pointLightViewProjection);
				gl.uniform3fv(this._uniforms.shadow_lightPosition, pointLight.getPosition());
				gl.uniform1i(this._uniforms.depthSampler, 0);
				gl.uniform1i(this._uniforms.albedoSampler, 1);
			gl.useProgram(null);
		gl.bindVertexArray(null);
	}

	render() {
		// this.#drawGBuffer();
		this.#drawLightDepthFramebuffer();

		if (this.debug) {
			this.#renderDebug();

			return;
		}

		// this.#drawFinal();
		this.#drawShadow();
	}

	async #loadShaders() {
		const shaderLoader = new ShaderLoader();

		const quadVertexShaderSource = await shaderLoader.load("assets/shaders/quad.vert");
		// const gBufferVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.vert");
		const lightDepthVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/light_depth.vert");
		// const finalVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/final.vert");
		const shadowVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/shadow.vert");

		const depthFragmentShaderSource = await shaderLoader.load("assets/shaders/depth.frag");
		const emptyFragmentShaderSource = await shaderLoader.load("assets/shaders/empty.frag");
		// const textureFragmentShaderSource = await shaderLoader.load("assets/shaders/texture.frag");
		// const gBufferFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.frag");
		// const finalFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/final.frag");
		const shadowFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/shadow.frag");

		// this._programs.gBuffer = this._createProgram(gBufferVertexShaderSource, gBufferFragmentShaderSource);
		this._programs.lightDepth = this._createProgram(lightDepthVertexShaderSource, emptyFragmentShaderSource);
		// this._programs.final = this._createProgram(finalVertexShaderSource, finalFragmentShaderSource);
		this._programs.shadow = this._createProgram(shadowVertexShaderSource, shadowFragmentShaderSource);
		// this._programs.debugGBuffer = this._createProgram(quadVertexShaderSource, textureFragmentShaderSource);
		this._programs.debugDepth = this._createProgram(quadVertexShaderSource, depthFragmentShaderSource);
	}

	/* #createGBuffer() {
		const gl = this._context;

		this._framebuffers.gBuffer = gl.createFramebuffer();
		this._textures.gBuffer_position = gl.createTexture();
		this._textures.gBuffer_normal = gl.createTexture();
		this._textures.gBuffer_color = gl.createTexture();
		this._textures.gBuffer_depth = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_position);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA8,
				this._viewport[2],
				this._viewport[3],
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_normal);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA8,
				this._viewport[2],
				this._viewport[3],
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_color);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA8,
				this._viewport[2],
				this._viewport[3],
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_depth);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.DEPTH_COMPONENT24,
				this._viewport[2],
				this._viewport[3],
				0,
				gl.DEPTH_COMPONENT,
				gl.UNSIGNED_INT,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffers.gBuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textures.gBuffer_position, 0);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._textures.gBuffer_normal, 0);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this._textures.gBuffer_color, 0);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._textures.gBuffer_depth, 0);
			gl.drawBuffers([
				gl.COLOR_ATTACHMENT0,
				gl.COLOR_ATTACHMENT1,
				gl.COLOR_ATTACHMENT2,
			]);

			if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
				throw Error("The G-buffer is invalid.");
			}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	} */

	#createLightDepthFramebuffer() {
		const gl = this._context;

		this._framebuffers.lightDepth = gl.createFramebuffer();
		this._textures.lightDepth_depth = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, this._textures.lightDepth_depth);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.DEPTH_COMPONENT24,
				this._viewport[2],
				this._viewport[3],
				0,
				gl.DEPTH_COMPONENT,
				gl.UNSIGNED_INT,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
		gl.bindTexture(gl.TEXTURE_2D, null);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffers.lightDepth);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._textures.lightDepth_depth, 0);

			if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
				throw Error("The light depth buffer is invalid.");
			}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	/* #drawGBuffer() {
		const gl = this._context;
		const meshes = this._scene.getMeshes();
		const mesh = meshes[0];
		const geometry = mesh.getGeometry();
		const material = mesh.getMaterial();

		gl.bindVertexArray(this._vaos.gBuffer);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffers.gBuffer);
				gl.clearColor(.125, .129, .141, 1);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				gl.useProgram(this._programs.gBuffer);
					gl.uniformMatrix4fv(this._uniforms.gBuffer_cameraProjection, false, this._camera.getProjection());
					gl.uniformMatrix4fv(this._uniforms.gBuffer_cameraView, false, this._camera.getView());

					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.gBuffer_index);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.getIndices(), gl.STATIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_vertex);
					gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_normal);
					gl.bufferData(gl.ARRAY_BUFFER, geometry.getNormals(), gl.STATIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.gBuffer_uv);
					gl.bufferData(gl.ARRAY_BUFFER, geometry.getUVs(), gl.STATIC_DRAW);

					gl.bindTexture(gl.TEXTURE_2D, this.#textures[material.getTextureIndex()]);

					gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, meshes.length);
				gl.useProgram(null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindVertexArray(null);
	} */

	#drawLightDepthFramebuffer() {
		const gl = this._context;
		const meshes = this._scene.getMeshes();
		const mesh = meshes[0];
		const geometry = mesh.getGeometry();

		gl.cullFace(gl.FRONT);
			gl.bindVertexArray(this._vaos.lightDepth);
				gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffers.lightDepth);
					gl.clear(gl.DEPTH_BUFFER_BIT);

					gl.useProgram(this._programs.lightDepth);
						gl.uniformMatrix4fv(this._uniforms.lightDepth_lightViewProjection, false, this._scene.getPointLight().getViewProjection());

						gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.lightDepth_index);
						gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.getIndices(), gl.STATIC_DRAW);

						gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.lightDepth_vertex);
						gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

						gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, meshes.length);
					gl.useProgram(null);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindVertexArray(null);
		gl.cullFace(gl.BACK);
	}

	/* #drawFinal() {
		const gl = this._context;

		gl.bindVertexArray(this._vaos.final);
			gl.useProgram(this._programs.final);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_position);

				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_normal);

				gl.activeTexture(gl.TEXTURE2);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_color);

				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

				gl.bindTexture(gl.TEXTURE_2D, null);

				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, null);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, null);
			gl.useProgram(null);
		gl.bindVertexArray(null);
	} */

	#drawShadow() {
		const gl = this._context;
		const meshes = this._scene.getMeshes();
		const mesh = meshes[0];
		const geometry = mesh.getGeometry();
		const material = mesh.getMaterial();

		gl.bindVertexArray(this._vaos.shadow);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(this._programs.shadow);
				gl.uniformMatrix4fv(this._uniforms.shadow_cameraViewProjection, false, this._camera.getViewProjection());
				gl.uniform3fv(this._uniforms.shadow_cameraPosition, this._camera.getPosition());
				gl.uniformMatrix4fv(this._uniforms.shadow_lightViewProjection, false, this._scene.getPointLight().getViewProjection());
				gl.uniform3fv(this._uniforms.shadow_lightPosition, this._scene.getPointLight().getPosition());

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.shadow_index);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.getIndices(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_vertex);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_normal);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getNormals(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.shadow_uv);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getUVs(), gl.STATIC_DRAW);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.lightDepth_depth);

				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, this.#textures[material.getTextureIndex()]);

				gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, meshes.length);
			gl.useProgram(null);
		gl.bindVertexArray(null);
	}

	#renderDebug() {
		const gl = this._context;
		const viewportHalf = new Vector4(this._viewport).divideScalar(2);

		gl.enable(gl.SCISSOR_TEST);
			/* gl.useProgram(this._programs.debugGBuffer);
				gl.scissor(0, viewportHalf[3], viewportHalf[2], viewportHalf[3]);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_position);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

				gl.scissor(viewportHalf[2], viewportHalf[3], viewportHalf[2], viewportHalf[3]);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_normal);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

				gl.scissor(0, 0, viewportHalf[2], viewportHalf[3]);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.gBuffer_color);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); */
			gl.useProgram(this._programs.debugDepth);
				gl.scissor(viewportHalf[2], 0, viewportHalf[2], viewportHalf[3]);
				gl.bindTexture(gl.TEXTURE_2D, this._textures.lightDepth_depth);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			gl.useProgram(null);
		gl.disable(gl.SCISSOR_TEST);
	}
}