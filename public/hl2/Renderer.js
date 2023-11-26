import {Scene, TextureImage} from "../../src/index.js";
import {ShaderLoader} from "../../src/Loader/index.js";
import {Vector2} from "../../src/math/index.js";
import {WebGLRenderer} from "../../src/Renderer/index.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Renderer extends WebGLRenderer {
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
		this._uniforms.textureIndex = gl.getUniformLocation(this._programs.main, "u_texture_index");
		this._uniforms.normalMapIndex = gl.getUniformLocation(this._programs.main, "u_normal_map_index");
		this._uniforms.lightColor = gl.getUniformLocation(this._programs.main, "u_light_color");
		this._uniforms.lightIntensity = gl.getUniformLocation(this._programs.main, "u_light_intensity");

		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");

		gl.useProgram(this._programs.crosshair);

		this._uniforms.crosshairViewport = gl.getUniformLocation(this._programs.crosshair, "u_viewport");
		gl.uniform2f(this._uniforms.crosshairViewport, this._viewport[2], this._viewport[3]);

		gl.useProgram(null);
	}

	/**
	 * @param {import("../../src/Loader/TextureLoader.js").TextureDescriptor[]} textureDescriptors
	 */
	createTextureArray(textureDescriptors) {
		const gl = this._context;
		const length = textureDescriptors.length;

		this._textures.array = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._textures.array);
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 512, 512, length);

		for (let i = 0; i < length; i++) {
			this.#addSubRectangle(i, textureDescriptors[i]);
		}
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;

		const gl = this._context;

		this._buffers.scene = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.scene);
	}

	render() {
		const gl = this._context;

		gl.useProgram(this._programs.main);
		gl.bindVertexArray(this._vaos.scene);

		const scene = this._scene;
		const meshes = scene.getMeshes();
		const pointLight = scene.pointLight;
		const camera = this._camera;

		gl.uniformMatrix4fv(this._uniforms.cameraProjection, false, camera.getProjection());
		gl.uniformMatrix4fv(this._uniforms.cameraView, false, camera.getView());
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

			gl.uniformMatrix3fv(this._uniforms.textureMatrix, false, material.textureMatrix);

			gl.uniform1ui(this._uniforms.textureIndex, material.texture.getZOffset());
			gl.uniform1ui(this._uniforms.normalMapIndex, material.normalMap.getZOffset());

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

		gl.bindVertexArray(null);
		gl.useProgram(this._programs.crosshair);

		gl.drawArrays(gl.POINTS, 0, 5);

		gl.useProgram(null);
	}

	/**
	 * Adds a sub-rectangle to the texture array.
	 * 
	 * @param {Number} index
	 * @param {import("../../src/Loader/TextureLoader.js").TextureDescriptor} textureDescriptor
	 */
	#addSubRectangle(index, textureDescriptor) {
		const gl = this._context;
		const viewport = new Vector2(textureDescriptor.image.width, textureDescriptor.image.height);

		gl.texSubImage3D(
			gl.TEXTURE_2D_ARRAY,
			0,
			0,
			0,
			index,
			viewport[0],
			viewport[1],
			1,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			textureDescriptor.image,
		);

		this._images[textureDescriptor.path] = new TextureImage({
			image: textureDescriptor.image,
			viewport: viewport.clone(),
			zOffset: index,
		});
	}
}