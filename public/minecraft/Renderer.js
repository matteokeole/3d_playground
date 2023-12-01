import {WebGLRenderer} from "../../src/Renderer/index.js";
import {Matrix4} from "../../src/math/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";

export class Renderer extends WebGLRenderer {
	/**
	 * @type {WebGLTexture[]}
	 */
	#textures;

	async build() {
		super.build();

		this.#textures = [];

		const gl = this._context;

		const shaderLoader = new ShaderLoader();
		const gBufferVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.vert");
		const gBufferFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.frag");
		const screenVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/screen.vert");
		const screenFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/screen.frag");
		const lightingVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/lighting.vert");
		const lightingFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/lighting.frag");
		const depthFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/depth.frag");

		this._programs.gBuffer = this._createProgram(gBufferVertexShaderSource, gBufferFragmentShaderSource);
		this._programs.screen = this._createProgram(screenVertexShaderSource, screenFragmentShaderSource);
		this._programs.lighting = this._createProgram(lightingVertexShaderSource, lightingFragmentShaderSource);
		this._programs.depth = this._createProgram(screenVertexShaderSource, depthFragmentShaderSource);

		gl.frontFace(gl.CW);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		this._vaos.gBuffer = gl.createVertexArray();
		this._vaos.screen = gl.createVertexArray();
		this._vaos.lighting = gl.createVertexArray();

		gl.useProgram(this._programs.gBuffer);
		gl.bindVertexArray(this._vaos.gBuffer);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(5);
		gl.enableVertexAttribArray(6);

		this._uniforms.projection = gl.getUniformLocation(this._programs.gBuffer, "u_projection");
		this._uniforms.view = gl.getUniformLocation(this._programs.gBuffer, "u_view");

		this._buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.index);

		this._buffers.vertex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertex);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		/**
		 * Contains all the world matrices, splitted into four vec4 attributes.
		 */
		this._buffers.world = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.world);
		for (let i = 0, index = 1; i < 4; i++, index++) {
			gl.enableVertexAttribArray(index);
			gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 64, i * 16);
			gl.vertexAttribDivisor(index, 1);
		}

		this._buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.normal);
		gl.vertexAttribPointer(5, 3, gl.FLOAT, false, 0, 0);

		this._buffers.uv = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
		gl.vertexAttribPointer(6, 2, gl.FLOAT, true, 0, 0);

		this.buildGBuffer();

		gl.useProgram(this._programs.lighting);
		gl.bindVertexArray(this._vaos.lighting);

		this._uniforms.positionSampler = gl.getUniformLocation(this._programs.lighting, "u_position_sampler");
		this._uniforms.normalSampler = gl.getUniformLocation(this._programs.lighting, "u_normal_sampler");
		this._uniforms.colorSampler = gl.getUniformLocation(this._programs.lighting, "u_color_sampler");
		this._uniforms.depthSampler = gl.getUniformLocation(this._programs.lighting, "u_depth_sampler");
		this._uniforms.lightDirection = gl.getUniformLocation(this._programs.lighting, "u_light_direction");
		this._uniforms.lightColor = gl.getUniformLocation(this._programs.lighting, "u_light_color");
		this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.lighting, "u_light_intensity");

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	buildGBuffer() {
		const gl = this._context;

		this.gBuffer = {
			framebuffer: gl.createFramebuffer(),
			position: this.buildGBufferTexture(),
			normal: this.buildGBufferTexture(),
			color: this.buildGBufferTexture(),
			depth: this.buildGBufferDepthTexture(),
		};

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.gBuffer.position, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.gBuffer.normal, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.gBuffer.color, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.gBuffer.depth, 0);
		gl.drawBuffers([
			gl.COLOR_ATTACHMENT0,
			gl.COLOR_ATTACHMENT1,
			gl.COLOR_ATTACHMENT2,
		]);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			throw Error("Invalid framebuffer.");
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	buildGBufferTexture() {
		const gl = this._context;

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
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

		return texture;
	}

	buildGBufferDepthTexture() {
		const gl = this._context;

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
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

		return texture;
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
		const meshes = this._scene.getMeshes();
		const lights = this._scene.lights;

		this._context.useProgram(this._programs.gBuffer);
		this._context.bindVertexArray(this._vaos.gBuffer);

		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.world);

		const worlds = new Float32Array(meshes.length * 16);

		for (let i = 0, mesh; i < meshes.length; i++) {
			mesh = meshes[i];

			const world = Matrix4
				.translation(mesh.getPosition())
				.multiply(Matrix4.scale(mesh.scale));

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
		const gl = this._context;

		const viewportHalf = this._viewport.clone().divideScalar(2);
		const meshes = this._scene.getMeshes();
		const firstMesh = meshes[0];
		const firstMeshGeometry = firstMesh.getGeometry();
		const firstMeshMaterial = firstMesh.getMaterial();

		// G-Buffer
		{
			gl.useProgram(this._programs.gBuffer);
			gl.bindVertexArray(this._vaos.gBuffer);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.gBuffer.framebuffer);

			gl.clearColor(.125, .129, .141, 1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.uniformMatrix4fv(this._uniforms.projection, false, this._camera.getProjection());
			gl.uniformMatrix4fv(this._uniforms.view, false, this._camera.getView());

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, firstMeshGeometry.getIndices(), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, firstMeshGeometry.getVertices(), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, firstMeshGeometry.getNormals(), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
			gl.bufferData(gl.ARRAY_BUFFER, firstMeshGeometry.getUVs(), gl.STATIC_DRAW);

			gl.bindTexture(gl.TEXTURE_2D, this.#textures[firstMeshMaterial.getTextureIndex()]);

			gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0, meshes.length);

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		if (this.debug) {
			gl.enable(gl.SCISSOR_TEST);

			{
				gl.useProgram(this._programs.screen);
				gl.bindVertexArray(this._vaos.screen);

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

				gl.bindVertexArray(null);
				gl.useProgram(null);
			}

			// Depth
			{
				gl.useProgram(this._programs.depth);

				gl.scissor(viewportHalf[2], 0, viewportHalf[2], viewportHalf[3]);

				gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.depth);

				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

				gl.useProgram(null);
			}

			gl.disable(gl.SCISSOR_TEST);
		} else {
			gl.useProgram(this._programs.lighting);
			gl.bindVertexArray(this._vaos.lighting);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.position);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.normal);
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this.gBuffer.color);

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}
}