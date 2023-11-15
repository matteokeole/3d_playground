import {Renderer as _Renderer} from "../../src/index.js";
import {Matrix4} from "../../src/math/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";

export class Renderer extends _Renderer {
	async build() {
		super.build();

		const gl = this._context;

		const shaderLoader = new ShaderLoader();
		const gBufferVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.vert");
		const gBufferFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/g_buffer.frag");
		const screenVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/screen.vert");
		const screenFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/screen.frag");
		const lightingVertexShaderSource = await shaderLoader.load("public/minecraft/shaders/lighting.vert");
		const lightingFragmentShaderSource = await shaderLoader.load("public/minecraft/shaders/lighting.frag");

		this._programs.gBuffer = this._createProgram(gBufferVertexShaderSource, gBufferFragmentShaderSource);
		this._programs.screen = this._createProgram(screenVertexShaderSource, screenFragmentShaderSource);
		this._programs.lighting = this._createProgram(lightingVertexShaderSource, lightingFragmentShaderSource);

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
		const {scene, camera} = this;
		const viewportHalf = this._viewport.clone().divideScalar(2);
		const {meshes} = scene;
		const firstMesh = meshes[0];
		const firstMeshGeometry = firstMesh.getGeometry();
		const firstMeshMaterial = firstMesh.getMaterial();

		// G-Buffer
		{
			this._context.useProgram(this._programs.gBuffer);
			this._context.bindVertexArray(this._vaos.gBuffer);
			this._context.bindFramebuffer(this._context.FRAMEBUFFER, this.gBuffer.framebuffer);

			this._context.clearColor(.125, .129, .141, 1);
			this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);

			this._context.uniformMatrix4fv(this._uniforms.projection, false, camera.projection);
			this._context.uniformMatrix4fv(this._uniforms.view, false, camera.view);

			this._context.bufferData(this._context.ELEMENT_ARRAY_BUFFER, firstMeshGeometry.getIndices(), this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
			this._context.bufferData(this._context.ARRAY_BUFFER, firstMeshGeometry.getVertices(), this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.normal);
			this._context.bufferData(this._context.ARRAY_BUFFER, firstMeshGeometry.getNormals(), this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.uv);
			this._context.bufferData(this._context.ARRAY_BUFFER, firstMeshGeometry.getUVs(), this._context.STATIC_DRAW);

			this._context.bindTexture(this._context.TEXTURE_2D, firstMeshMaterial.texture);

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