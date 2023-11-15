import {AbstractMesh, Renderer as _Renderer} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {ColorMaterial, TextureMaterial} from "../../src/materials/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends _Renderer {
	/**
	 * @type {Float32Array}
	 */
	#defaultColor;

	/**
	 * @type {WebGLTexture}
	 */
	#defaultTexture;

	/**
	 * @todo Remove
	 * 
	 * @type {?AbstractMesh}
	 */
	player;

	/**
	 * @todo Remove
	 * 
	 * @type {?AbstractMesh}
	 */
	wall;

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
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); // Normalize?

		gl.enableVertexAttribArray(2);
		this._buffers.tangent = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.tangent);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(3);
		this._buffers.uv = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.uv);
		gl.vertexAttribPointer(3, 2, gl.FLOAT, true, 0, 0);

		gl.bindVertexArray(null);

		this._context.useProgram(this._programs.main);

		this._uniforms.projection = gl.getUniformLocation(this._programs.main, "u_projection");
		this._uniforms.view = gl.getUniformLocation(this._programs.main, "u_view");
		this._uniforms.cameraPosition = gl.getUniformLocation(this._programs.main, "u_camera_position");
		this._uniforms.meshPosition = gl.getUniformLocation(this._programs.main, "u_mesh_position");
		this._uniforms.lightPosition = gl.getUniformLocation(this._programs.main, "u_light_position");
		this._uniforms.texture = gl.getUniformLocation(this._programs.main, "u_texture");
		this._uniforms.color = gl.getUniformLocation(this._programs.main, "u_color");
		this._uniforms.textureMap = gl.getUniformLocation(this._programs.main, "u_texture_map");
		this._context.uniform1i(this._uniforms.textureMap, 0);
		this._uniforms.normalMap = gl.getUniformLocation(this._programs.main, "u_normal_map");
		this._context.uniform1i(this._uniforms.normalMap, 1);
		this._uniforms.lightColor = gl.getUniformLocation(this._programs.main, "u_light_color");
		this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.main, "u_light_intensity");
		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");

		this._context.useProgram(this._programs.crosshair);

		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");
		this._context.uniform2f(this._uniforms.crosshairViewport, this._viewport[2], this._viewport[3]);

		this._context.useProgram(null);

		this.#createDefaultColor();
		this.#createDefaultTexture();
	}

	/**
	 * @param {HTMLImageElement} image
	 */
	setupTexture(image) {
		this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGB, this._context.RGB, this._context.UNSIGNED_BYTE, image);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.LINEAR);
	}

	render() {
		this._context.useProgram(this._programs.main);
		this._context.bindVertexArray(this._vaos.main);

		const scene = this.scene;
		const meshes = scene.meshes;
		const camera = this.camera;

		this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);

		const firstLight = scene.lights[0];

		this._context.uniformMatrix4fv(this._uniforms.projection, false, camera.projection);
		this._context.uniformMatrix4fv(this._uniforms.view, false, camera.view);
		this._context.uniform3fv(this._uniforms.cameraPosition, camera.getPhysicalPosition());
		this._context.uniform3fv(this._uniforms.lightPosition, firstLight.position);
		this._context.uniform3fv(this._uniforms.lightColor, firstLight.color);
		this._context.uniform1f(this._uniforms.lightIntensity, firstLight.intensity);

		for (let i = 0, length = meshes.length; i < length; i++) {
			const mesh = meshes[i];
			const geometry = mesh.getGeometry();
			const material = mesh.getMaterial();

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.getVertices(), this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.normal);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.getNormals(), this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.tangent);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.getTangents(), this._context.STATIC_DRAW);

			this._context.uniform3fv(this._uniforms.meshPosition, mesh.getPosition());
			this._context.uniformMatrix3fv(this._uniforms.texture, false, material.textureMatrix);

			if (material instanceof ColorMaterial) {
				// Bind default texture
				this._context.bindTexture(this._context.TEXTURE_2D, this.#defaultTexture);

				// Bind color
				this._context.uniform3fv(this._uniforms.color, material.color);
			} else if (material instanceof TextureMaterial) {
				// Bind default color
				this._context.uniform3fv(this._uniforms.color, this.#defaultColor);

				// Bind texture
				this._context.activeTexture(this._context.TEXTURE0);
				this._context.bindTexture(this._context.TEXTURE_2D, material.texture);

				// Bind normal map
				this._context.activeTexture(this._context.TEXTURE1);
				this._context.bindTexture(this._context.TEXTURE_2D, material.normalMap);

				// Bind UVs
				this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.uv);
				this._context.bufferData(this._context.ARRAY_BUFFER, geometry.getUVs(), this._context.STATIC_DRAW);
			}

			if (geometry instanceof SSDPlaneGeometry) {
				this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
			} else {
				const indices = geometry.getIndices();

				this._context.bufferData(this._context.ELEMENT_ARRAY_BUFFER, indices, this._context.STATIC_DRAW);
				this._context.drawElements(this._context.TRIANGLES, indices.length, this._context.UNSIGNED_BYTE, 0);
			}
		}

		this._context.bindVertexArray(null);
		this._context.useProgram(this._programs.crosshair);

		this._context.drawArrays(this._context.POINTS, 0, 5);

		this._context.useProgram(null);
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