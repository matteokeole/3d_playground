import {Mesh, Scene} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {Material} from "../../src/materials/index.js";
import {WebGLRenderer} from "../../src/Renderer/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends WebGLRenderer {
	/**
	 * @type {Map.<Material, Mesh[]>}
	 */
	#meshesPerMaterial;

	/**
	 * @type {WebGLTexture[]}
	 */
	#textures;

	/**
	 * @type {WebGLFramebuffer}
	 */
	#gBuffer;

	/**
	 * @type {WebGLTexture}
	 */
	#gBufferDepth;

	async build() {
		super.build();

		this.#meshesPerMaterial = new Map();
		this.#textures = [];
		this.#gBuffer = null;
		this.#gBufferDepth = null;

		await this.#loadPrograms();

		const gl = this._context;

		gl.frontFace(gl.CW);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		this._vaos.scene = gl.createVertexArray();
		this._vaos.crosshair = gl.createVertexArray();

		gl.useProgram(this._programs.main);
		gl.bindVertexArray(this._vaos.scene);

		this._buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.index);

		gl.enableVertexAttribArray(0);
		this._buffers.vertex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertex);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(1);
		this._buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.normal);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(2);
		this._buffers.tangent = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.tangent);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(3);
		this._buffers.uv = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
		gl.vertexAttribPointer(3, 2, gl.FLOAT, true, 0, 0);

		gl.bindVertexArray(null);

		gl.useProgram(this._programs.main);

		this._uniforms.cameraProjection = gl.getUniformLocation(this._programs.main, "u_camera.projection");
		this._uniforms.cameraView = gl.getUniformLocation(this._programs.main, "u_camera.view");
		this._uniforms.cameraPosition = gl.getUniformLocation(this._programs.main, "u_camera.position");
		this._uniforms.lightPosition = gl.getUniformLocation(this._programs.main, "u_light.position");
		this._uniforms.textureMatrix = gl.getUniformLocation(this._programs.main, "u_texture_matrix");
		this._uniforms.texture = gl.getUniformLocation(this._programs.main, "u_texture");
		gl.uniform1i(this._uniforms.texture, 0);
		this._uniforms.normalMap = gl.getUniformLocation(this._programs.main, "u_normal_map");
		gl.uniform1i(this._uniforms.normalMap, 1);
		this._uniforms.lightColor = gl.getUniformLocation(this._programs.main, "u_light_color");
		this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.main, "u_light_intensity");

		gl.useProgram(this._programs.crosshair);
			this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");
		gl.useProgram(null);

		this.#createGBuffer();
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
			gl.generateMipmap(gl.TEXTURE_2D);

			this.#textures.push(texture);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;

		const meshes = this._scene.getMeshes();

		for (let i = 0; i < meshes.length; i++) {
			const material = meshes[i].getMaterial();

			const materialMeshes = this.#meshesPerMaterial.get(material) ?? [];
			materialMeshes.push(meshes[i]);

			this.#meshesPerMaterial.set(material, materialMeshes);
		}
	}

	render() {
		this.#clear();

		const gl = this._context;

		gl.useProgram(this._programs.main);
		gl.bindVertexArray(this._vaos.scene);

		const scene = this._scene;
		const pointLight = scene.getPointLight();
		const camera = this._camera;

		gl.uniformMatrix4fv(this._uniforms.cameraProjection, false, camera.getProjection());
		gl.uniformMatrix4fv(this._uniforms.cameraView, false, camera.getView());
		gl.uniform3fv(this._uniforms.cameraPosition, camera.getPhysicalPosition());
		gl.uniform3fv(this._uniforms.lightPosition, pointLight.position);
		gl.uniform3fv(this._uniforms.lightColor, pointLight.color);
		gl.uniform1f(this._uniforms.lightIntensity, pointLight.intensity);

		for (const [material, meshes] of this.#meshesPerMaterial) {
			gl.uniformMatrix3fv(this._uniforms.textureMatrix, false, material.getTextureMatrix());

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.#textures[material.getTextureIndex()]);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.#textures[material.getNormalMapIndex()]);

			for (let i = 0, length = meshes.length; i < length; i++) {
				const mesh = meshes[i];
				const geometry = mesh.getGeometry();

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertex);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.normal);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getNormals(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.tangent);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getTangents(), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getUVs(), gl.STATIC_DRAW);

				if (geometry instanceof SSDPlaneGeometry) {
					gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
				} else {
					const indices = geometry.getIndices();

					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
					gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
				}
			}
		}

		gl.bindVertexArray(null);

		this.#renderCrosshair();
	}

	async #loadShaders() {
		const shaderLoader = new ShaderLoader();

		// const quadVertexShaderSource = await shaderLoader.load("assets/shaders/quad.vert");
		const mainVertexShaderSource = await shaderLoader.load("public/hl2/shaders/main.vert");
		// const depthVertexShaderSource = await shaderLoader.load("public/hl2/shaders/depth.vert");
		const crosshairVertexShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.vert");

		// const depthFragmentShaderSource = await shaderLoader.load("assets/shaders/depth.frag");
		// const emptyFragmentShaderSource = await shaderLoader.load("assets/shaders/empty.frag");
		const mainFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/main.frag");
		const crosshairFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.frag");

		this._programs.main = this._createProgram(mainVertexShaderSource, mainFragmentShaderSource);
		this._programs.crosshair = this._createProgram(crosshairVertexShaderSource, crosshairFragmentShaderSource);
		// this._programs.depth = this._createProgram(depthVertexShaderSource, emptyFragmentShaderSource);
		// this._programs.debugDepth = this._createProgram(quadVertexShaderSource, depthFragmentShaderSource);
	}

	#createGBuffer() {
		const gl = this._context;

		this.#gBuffer = gl.createFramebuffer();
		this.#gBufferDepth = gl.createTexture();

		// Create depth map
		gl.bindTexture(gl.TEXTURE_2D, this.#gBufferDepth);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.DEPTH_COMPONENT24,
				1024,
				1024,
				0,
				gl.DEPTH_COMPONENT,
				gl.UNSIGNED_INT,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// Create G-buffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.#gBuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.#gBufferDepth, 0);

			if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
				throw new Error("The G-buffer is invalid.");
			}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	#clear() {
		const gl = this._context;

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	/* #draw() {
		const gl = this._context;

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	#renderGBufferPass() {
		const gl = this._context;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.#gBuffer);
			gl.useProgram(this._programs.depth);
				this.#draw();
			gl.useProgram(null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	#renderDepth() {
		const gl = this._context;

		gl.useProgram(this._programs.debugDepth);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.useProgram(null);
	} */

	#renderCrosshair() {
		const gl = this._context;

		gl.useProgram(this._programs.crosshair);
			gl.uniform2f(this._uniforms.crosshairViewport, this._viewport[2], this._viewport[3]);
			gl.drawArrays(gl.POINTS, 0, 5);
		gl.useProgram(null);
	}

	async #loadPrograms() {
		const shaderLoader = new ShaderLoader();

		const quadVertexShaderSource = await shaderLoader.load("assets/shaders/quad.vert");
		const mainVertexShaderSource = await shaderLoader.load("public/hl2/shaders/main.vert");
		const depthVertexShaderSource = await shaderLoader.load("public/hl2/shaders/depth.vert");
		const crosshairVertexShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.vert");

		const depthFragmentShaderSource = await shaderLoader.load("assets/shaders/depth.frag");
		const emptyFragmentShaderSource = await shaderLoader.load("assets/shaders/empty.frag");
		const mainFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/main.frag");
		const crosshairFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.frag");

		this._programs.main = this._createProgram(mainVertexShaderSource, mainFragmentShaderSource);
		this._programs.crosshair = this._createProgram(crosshairVertexShaderSource, crosshairFragmentShaderSource);
		this._programs.depth = this._createProgram(depthVertexShaderSource, emptyFragmentShaderSource);
		this._programs.debugDepth = this._createProgram(quadVertexShaderSource, depthFragmentShaderSource);
	}

	#createGBuffer() {
		const gl = this._context;

		this.#gBuffer = gl.createFramebuffer();
		this.#gBufferDepth = gl.createTexture();

		// Create depth map
		gl.bindTexture(gl.TEXTURE_2D, this.#gBufferDepth);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.DEPTH_COMPONENT24,
				1024,
				1024,
				0,
				gl.DEPTH_COMPONENT,
				gl.UNSIGNED_INT,
				null,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// Create G-buffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.#gBuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.#gBufferDepth, 0);

			if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
				throw new Error("The G-buffer is invalid.");
			}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	#clear() {
		const gl = this._context;

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	#draw() {
		const gl = this._context;

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	#renderGBufferPass() {
		const gl = this._context;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.#gBuffer);
			gl.useProgram(this._programs.depth);
				this.#draw();
			gl.useProgram(null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	#renderDepth() {
		const gl = this._context;

		gl.useProgram(this._programs.debugDepth);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.useProgram(null);
	}
}