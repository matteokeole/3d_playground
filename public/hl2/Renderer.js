import {AbstractMesh, AbstractRenderer} from "../../src/index.js";
import {ColorMaterial, TextureMaterial} from "../../src/materials/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends AbstractRenderer {
	/**
	 * @private
	 * @type {Float32Array}
	 */
	#defaultColor;

	/**
	 * @private
	 * @type {WebGLTexture}
	 */
	#defaultTexture;

	/** @type {?AbstractMesh} */
	player;

	/** @type {?AbstractMesh} */
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

		const {gl, programs, vaos, buffers, uniforms} = this;

		gl.frontFace(gl.CW);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		this.#defaultColor = Float32Array.of(1, 1, 1);

		vaos.main = gl.createVertexArray();
		vaos.crosshair = gl.createVertexArray();

		gl.useProgram(programs.main);
		gl.bindVertexArray(vaos.main);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);
		gl.enableVertexAttribArray(3);

		buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

		buffers.vertex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); // Normalize?

		buffers.tangent = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangent);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

		buffers.uv = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
		gl.vertexAttribPointer(3, 2, gl.FLOAT, true, 0, 0);

		this.createDefaultTexture();

		gl.bindVertexArray(null);
		gl.useProgram(null);

		uniforms.projection = gl.getUniformLocation(programs.main, "u_projection");
		uniforms.view = gl.getUniformLocation(programs.main, "u_view");
		uniforms.cameraPosition = gl.getUniformLocation(programs.main, "u_camera_position");
		uniforms.meshPosition = gl.getUniformLocation(programs.main, "u_mesh_position");
		uniforms.lightPosition = gl.getUniformLocation(programs.main, "u_light_position");
		uniforms.texture = gl.getUniformLocation(programs.main, "u_texture");
		uniforms.color = gl.getUniformLocation(programs.main, "u_color");
		uniforms.textureMap = gl.getUniformLocation(programs.main, "u_texture_map");
		uniforms.normalMap = gl.getUniformLocation(programs.main, "u_normal_map");
		uniforms.lightColor = gl.getUniformLocation(programs.main, "u_light_color");
		uniforms.lightIntensity = gl.getUniformLocation(programs.main, "u_light_intensity");
		uniforms.crosshair = {
			viewport: gl.getUniformLocation(programs.crosshair, "u_viewport"),
		};
	}

	createDefaultTexture() {
		const {gl} = this;

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
			Uint8Array.of(255, 255, 255, 255), // Uint8Array.of(1, 1, 1, 1)?
		);
	}

	setupTexture(image) {
		const {gl} = this;

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	prerender() {
		const {gl, programs, vaos, uniforms, viewport} = this;

		gl.useProgram(programs.main);

		gl.uniform1i(uniforms.textureMap, 0);
		gl.uniform1i(uniforms.normalMap, 1);

		gl.useProgram(programs.crosshair);

		gl.uniform2f(uniforms.crosshair.viewport, viewport[2], viewport[3]);

		gl.useProgram(null);
	}

	render() {
		super.render();

		const {gl, programs, vaos, buffers, uniforms, scene, camera} = this;
		const {meshes, lights} = scene;
		const {length} = meshes;

		gl.useProgram(programs.main);
		gl.bindVertexArray(vaos.main);

		gl.clearColor(...scene.background);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.uniformMatrix4fv(uniforms.projection, false, camera.projection);
		gl.uniformMatrix4fv(uniforms.view, false, camera.view);
		gl.uniform3fv(uniforms.cameraPosition, camera.position);
		gl.uniform3fv(uniforms.lightPosition, lights[0].position);
		gl.uniform3fv(uniforms.lightColor, lights[0].color);
		gl.uniform1f(uniforms.lightIntensity, lights[0].intensity);

		for (let i = 0; i < length; i++) {
			const mesh = meshes[i];
			const {geometry, material} = mesh;

			if (!(geometry instanceof SSDPlaneGeometry)) continue;

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangent);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.tangents, gl.STATIC_DRAW);

			gl.uniform3fv(uniforms.meshPosition, mesh.position);
			gl.uniformMatrix3fv(uniforms.texture, false, material.textureMatrix);

			if (material instanceof ColorMaterial) {
				gl.bindTexture(gl.TEXTURE_2D, this.#defaultTexture);
				gl.uniform3fv(uniforms.color, material.color);
			}

			if (material instanceof TextureMaterial) {
				gl.uniform3fv(uniforms.color, this.#defaultColor);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, material.texture.texture);

				gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
				gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW);

				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, material.normalMap.texture);
			}

			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}

		gl.bindVertexArray(null);
		gl.useProgram(programs.crosshair);

		gl.drawArrays(gl.POINTS, 0, 5);

		gl.useProgram(null);
	}
}