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
	 * @type {?AbstractMesh}
	 */
	player;

	/**
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

		this._programs.main = this._createProgram(mainVertexShaderSource, mainFragmentShaderSource);
		this._programs.crosshair = this._createProgram(crosshairVertexShaderSource, crosshairFragmentShaderSource);

		this._context.frontFace(this._context.CW);
		this._context.enable(this._context.CULL_FACE);
		this._context.enable(this._context.DEPTH_TEST);

		this.#defaultColor = Float32Array.of(1, 1, 1);

		this._vaos.main = this._context.createVertexArray();
		this._vaos.crosshair = this._context.createVertexArray();

		this._context.useProgram(this._programs.main);
		this._context.bindVertexArray(this._vaos.main);

		this._context.enableVertexAttribArray(0);
		this._context.enableVertexAttribArray(1);
		this._context.enableVertexAttribArray(2);
		this._context.enableVertexAttribArray(3);

		this._buffers.index = this._context.createBuffer();
		this._context.bindBuffer(this._context.ELEMENT_ARRAY_BUFFER, this._buffers.index);

		this._buffers.vertex = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
		this._context.vertexAttribPointer(0, 3, this._context.FLOAT, false, 0, 0);

		this._buffers.normal = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.normal);
		this._context.vertexAttribPointer(1, 3, this._context.FLOAT, false, 0, 0); // Normalize?

		this._buffers.tangent = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.tangent);
		this._context.vertexAttribPointer(2, 3, this._context.FLOAT, false, 0, 0);

		this._buffers.uv = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.uv);
		this._context.vertexAttribPointer(3, 2, this._context.FLOAT, true, 0, 0);

		this.createDefaultTexture();

		this._context.bindVertexArray(null);
		this._context.useProgram(null);

		this._uniforms.projection = this._context.getUniformLocation(this._programs.main, "u_projection");
		this._uniforms.view = this._context.getUniformLocation(this._programs.main, "u_view");
		this._uniforms.cameraPosition = this._context.getUniformLocation(this._programs.main, "u_camera_position");
		this._uniforms.meshPosition = this._context.getUniformLocation(this._programs.main, "u_mesh_position");
		this._uniforms.lightPosition = this._context.getUniformLocation(this._programs.main, "u_light_position");
		this._uniforms.texture = this._context.getUniformLocation(this._programs.main, "u_texture");
		this._uniforms.color = this._context.getUniformLocation(this._programs.main, "u_color");
		this._uniforms.textureMap = this._context.getUniformLocation(this._programs.main, "u_texture_map");
		this._uniforms.normalMap = this._context.getUniformLocation(this._programs.main, "u_normal_map");
		this._uniforms.lightColor = this._context.getUniformLocation(this._programs.main, "u_light_color");
		this._uniforms.lightIntensity = this._context.getUniformLocation(this._programs.main, "u_light_intensity");
		this._uniforms.crosshair = {
			viewport: this._context.getUniformLocation(this._programs.crosshair, "u_viewport"),
		};
	}

	createDefaultTexture() {
		this.#defaultTexture = this._context.createTexture();
		this._context.bindTexture(this._context.TEXTURE_2D, this.#defaultTexture);
		this._context.texImage2D(
			this._context.TEXTURE_2D,
			0,
			this._context.RGBA,
			1,
			1,
			0,
			this._context.RGBA,
			this._context.UNSIGNED_BYTE,
			Uint8Array.of(255, 255, 255, 255), // Uint8Array.of(1, 1, 1, 1)?
		);
	}

	setupTexture(image) {
		this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGB, this._context.RGB, this._context.UNSIGNED_BYTE, image);
		this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.LINEAR);
	}

	prerender() {
		this._context.useProgram(this._programs.main);

		this._context.uniform1i(this._uniforms.textureMap, 0);
		this._context.uniform1i(this._uniforms.normalMap, 1);

		this._context.useProgram(this._programs.crosshair);

		this._context.uniform2f(this._uniforms.crosshair.viewport, this._viewport[2], this._viewport[3]);

		this._context.useProgram(null);
	}

	render() {
		super.render();

		this._context.useProgram(this._programs.main);
		this._context.bindVertexArray(this._vaos.main);

		const {scene, camera} = this;
		const {meshes} = scene;
		const background = scene.background;

		this._context.clearColor(background[0], background[1], background[2], background[3]);
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
				this._context.bindTexture(this._context.TEXTURE_2D, material.texture.texture);

				// Bind normal map
				this._context.activeTexture(this._context.TEXTURE1);
				this._context.bindTexture(this._context.TEXTURE_2D, material.normalMap.texture);

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
}