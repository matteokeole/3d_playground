import {ShaderLoader} from "../../src/Loader/index.js";
import {ColorMaterial, TextureMaterial} from "../../src/materials/index.js";
import {WebGLRenderer} from "../../src/Renderer/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends WebGLRenderer {
	/**
	 * @type {Float32Array}
	 */
	#defaultColor;

	/**
	 * @type {WebGLTexture}
	 */
	#defaultTexture;

	async build() {
		super.build();

		const shaderLoader = new ShaderLoader();
		const mainVertexShaderSource = await shaderLoader.load("public/hl2/shaders/main.vert");
		const mainFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/main.frag");
		const crosshairVertexShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.vert");
		const crosshairFragmentShaderSource = await shaderLoader.load("public/hl2/shaders/crosshair.frag");

		const gl = this._context;

		this._programs.main = this._createProgram(mainVertexShaderSource, mainFragmentShaderSource);
		this._programs.crosshair = this._createProgram(crosshairVertexShaderSource, crosshairFragmentShaderSource);

		gl.frontFace(gl.CW);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		this._vaos.main = gl.createVertexArray();
		this._vaos.crosshair = gl.createVertexArray();

		gl.useProgram(this._programs.main);
		gl.bindVertexArray(this._vaos.main);

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
		this._uniforms.texture = gl.getUniformLocation(this._programs.main, "u_texture");
		this._uniforms.color = gl.getUniformLocation(this._programs.main, "u_color");
		this._uniforms.textureMap = gl.getUniformLocation(this._programs.main, "u_texture_map");
		gl.uniform1i(this._uniforms.textureMap, 0);
		this._uniforms.normalMap = gl.getUniformLocation(this._programs.main, "u_normal_map");
		gl.uniform1i(this._uniforms.normalMap, 1);
		this._uniforms.lightColor = gl.getUniformLocation(this._programs.main, "u_light_color");
		this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.main, "u_light_intensity");
		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");

		gl.useProgram(this._programs.crosshair);

		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");
		gl.uniform2f(this._uniforms.crosshairViewport, this._viewport[2], this._viewport[3]);

		gl.useProgram(null);

		this.#createDefaultColor();
		this.#createDefaultTexture();
	}

	render() {
		const gl = this._context;

		gl.useProgram(this._programs.main);
		gl.bindVertexArray(this._vaos.main);

		const scene = this._scene;
		const meshes = scene.getMeshes();
		const pointLight = scene.pointLight;
		const camera = this._camera;

		gl.uniformMatrix4fv(this._uniforms.cameraProjection, false, camera.projection);
		gl.uniformMatrix4fv(this._uniforms.cameraView, false, camera.view);
		gl.uniform3fv(this._uniforms.cameraPosition, camera.getPhysicalPosition());
		gl.uniform3fv(this._uniforms.lightPosition, pointLight.position);
		gl.uniform3fv(this._uniforms.lightColor, pointLight.color);
		gl.uniform1f(this._uniforms.lightIntensity, pointLight.intensity);

		for (let i = 0, length = meshes.length; i < length; i++) {
			const mesh = meshes[i];
			const geometry = mesh.getGeometry();
			const material = mesh.getMaterial();

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.getNormals(), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.tangent);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.getTangents(), gl.STATIC_DRAW);

			gl.uniformMatrix3fv(this._uniforms.texture, false, material.textureMatrix);

			if (material instanceof ColorMaterial) {
				// Bind default texture
				gl.bindTexture(gl.TEXTURE_2D, this.#defaultTexture);

				// Bind color
				gl.uniform3fv(this._uniforms.color, material.color);
			} else if (material instanceof TextureMaterial) {
				// Bind default color
				gl.uniform3fv(this._uniforms.color, this.#defaultColor);

				// Bind texture
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, material.texture);

				// Bind normal map
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, material.normalMap);

				// Bind UVs
				gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.getUVs(), gl.STATIC_DRAW);
			}

			if (geometry instanceof SSDPlaneGeometry) {
				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			} else {
				const indices = geometry.getIndices();

				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
				gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
			}
		}

		gl.bindVertexArray(null);
		gl.useProgram(this._programs.crosshair);

		gl.drawArrays(gl.POINTS, 0, 5);

		gl.useProgram(null);
	}

	/**
	 * @param {HTMLImageElement} image
	 */
	_createTexture(image) {
		const gl = this._context;
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		return texture;
	}

	/**
	 * Creates the default color for textured meshes.
	 */
	#createDefaultColor() {
		this.#defaultColor = Float32Array.of(1, 1, 1);
	}

	/**
	 * Creates a 1x1 white pixel as default texture.
	 */
	#createDefaultTexture() {
		const gl = this._context;

		this.#defaultTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.#defaultTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			Uint8Array.of(255, 255, 255, 255),
		);
	}
}