import {AbstractMesh, AbstractRenderer} from "../../src/index.js";
import {ColorMaterial, TextureMaterial} from "../../src/materials/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends AbstractRenderer {
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

		this.createProgram(
			"main",
			await (await fetch("public/hl2/shaders/main.vert")).text(),
			await (await fetch("public/hl2/shaders/main.frag")).text(),
		);

		this.createProgram(
			"crosshair",
			await (await fetch("public/hl2/shaders/crosshair.vert")).text(),
			await (await fetch("public/hl2/shaders/crosshair.frag")).text(),
		);

		const {programs, vaos, buffers, uniforms} = this;

		this._context.frontFace(this._context.CW);
		this._context.enable(this._context.CULL_FACE);
		this._context.enable(this._context.DEPTH_TEST);

		this.#defaultColor = Float32Array.of(1, 1, 1);

		vaos.main = this._context.createVertexArray();
		vaos.crosshair = this._context.createVertexArray();

		this._context.useProgram(programs.main);
		this._context.bindVertexArray(vaos.main);

		this._context.enableVertexAttribArray(0);
		this._context.enableVertexAttribArray(1);
		this._context.enableVertexAttribArray(2);
		this._context.enableVertexAttribArray(3);

		buffers.index = this._context.createBuffer();
		this._context.bindBuffer(this._context.ELEMENT_ARRAY_BUFFER, buffers.index);

		buffers.vertex = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.vertex);
		this._context.vertexAttribPointer(0, 3, this._context.FLOAT, false, 0, 0);

		buffers.normal = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.normal);
		this._context.vertexAttribPointer(1, 3, this._context.FLOAT, false, 0, 0); // Normalize?

		buffers.tangent = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.tangent);
		this._context.vertexAttribPointer(2, 3, this._context.FLOAT, false, 0, 0);

		buffers.uv = this._context.createBuffer();
		this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.uv);
		this._context.vertexAttribPointer(3, 2, this._context.FLOAT, true, 0, 0);

		this.createDefaultTexture();

		this._context.bindVertexArray(null);
		this._context.useProgram(null);

		uniforms.projection = this._context.getUniformLocation(programs.main, "u_projection");
		uniforms.view = this._context.getUniformLocation(programs.main, "u_view");
		uniforms.cameraPosition = this._context.getUniformLocation(programs.main, "u_camera_position");
		uniforms.meshPosition = this._context.getUniformLocation(programs.main, "u_mesh_position");
		uniforms.lightPosition = this._context.getUniformLocation(programs.main, "u_light_position");
		uniforms.texture = this._context.getUniformLocation(programs.main, "u_texture");
		uniforms.color = this._context.getUniformLocation(programs.main, "u_color");
		uniforms.textureMap = this._context.getUniformLocation(programs.main, "u_texture_map");
		uniforms.normalMap = this._context.getUniformLocation(programs.main, "u_normal_map");
		uniforms.lightColor = this._context.getUniformLocation(programs.main, "u_light_color");
		uniforms.lightIntensity = this._context.getUniformLocation(programs.main, "u_light_intensity");
		uniforms.crosshair = {
			viewport: this._context.getUniformLocation(programs.crosshair, "u_viewport"),
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
		const {programs, vaos, uniforms} = this;

		this._context.useProgram(programs.main);

		this._context.uniform1i(uniforms.textureMap, 0);
		this._context.uniform1i(uniforms.normalMap, 1);

		this._context.useProgram(programs.crosshair);

		this._context.uniform2f(uniforms.crosshair.viewport, this._viewport[2], this._viewport[3]);

		this._context.useProgram(null);
	}

	render() {
		super.render();

		const {programs, vaos, buffers, uniforms, scene, camera} = this;
		const {meshes, lights} = scene;
		const {length} = meshes;

		this._context.useProgram(programs.main);
		this._context.bindVertexArray(vaos.main);

		this._context.clearColor(...scene.background);
		this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);

		this._context.uniformMatrix4fv(uniforms.projection, false, camera.projection);
		this._context.uniformMatrix4fv(uniforms.view, false, camera.view);
		this._context.uniform3fv(uniforms.cameraPosition, camera.position);
		this._context.uniform3fv(uniforms.lightPosition, lights[0].position);
		this._context.uniform3fv(uniforms.lightColor, lights[0].color);
		this._context.uniform1f(uniforms.lightIntensity, lights[0].intensity);

		for (let i = 0; i < length; i++) {
			const mesh = meshes[i];
			const {geometry, material} = mesh;

			if (!(geometry instanceof SSDPlaneGeometry)) continue;

			this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.vertex);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.vertices, this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.normal);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.normals, this._context.STATIC_DRAW);

			this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.tangent);
			this._context.bufferData(this._context.ARRAY_BUFFER, geometry.tangents, this._context.STATIC_DRAW);

			this._context.uniform3fv(uniforms.meshPosition, mesh.position);
			this._context.uniformMatrix3fv(uniforms.texture, false, material.textureMatrix);

			if (material instanceof ColorMaterial) {
				this._context.bindTexture(this._context.TEXTURE_2D, this.#defaultTexture);
				this._context.uniform3fv(uniforms.color, material.color);
			}

			if (material instanceof TextureMaterial) {
				this._context.uniform3fv(uniforms.color, this.#defaultColor);

				this._context.activeTexture(this._context.TEXTURE0);
				this._context.bindTexture(this._context.TEXTURE_2D, material.texture.texture);

				this._context.bindBuffer(this._context.ARRAY_BUFFER, buffers.uv);
				this._context.bufferData(this._context.ARRAY_BUFFER, geometry.uvs, this._context.STATIC_DRAW);

				this._context.activeTexture(this._context.TEXTURE1);
				this._context.bindTexture(this._context.TEXTURE_2D, material.normalMap.texture);
			}

			this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
		}

		this._context.bindVertexArray(null);
		this._context.useProgram(programs.crosshair);

		this._context.drawArrays(this._context.POINTS, 0, 5);

		this._context.useProgram(null);
	}
}