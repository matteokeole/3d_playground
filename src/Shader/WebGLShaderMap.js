import {WebGLShader} from "./WebGLShader.js";

export class WebGLShaderMap {
	#context;
	#shaders;

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {WebGLShader[]} shaders
	 */
	constructor(context, shaders) {
		this.#context = context;
		this.#shaders = shaders;
	}

	/**
	 * @todo Use {@link https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/} extension
	 */
	compile() {
		for (const shader of this.#shaders) {
			this.#context.compileShader(shader.getVertexShader());
			this.#context.compileShader(shader.getFragmentShader());
		}

		for (const shader of this.#shaders) {
			this.#context.attachShader(shader.getProgram(), shader.getVertexShader());
			this.#context.attachShader(shader.getProgram(), shader.getFragmentShader());
		}

		for (const shader of this.#shaders) {
			this.#context.linkProgram(shader.getProgram());
		}

		for (const shader of this.#shaders) {
			this.#checkProgramStatus(shader);
		}

		for (const shader of this.#shaders) {
			this.#context.detachShader(shader.getProgram(), shader.getVertexShader());
			this.#context.detachShader(shader.getProgram(), shader.getFragmentShader());
		}
	}

	/**
	 * @param {WebGLShader} shader
	 */
	#checkProgramStatus(shader) {
		if (this.#context.getProgramParameter(shader.getProgram(), this.#context.LINK_STATUS)) {
			return;
		}

		/**
		 * @todo Format error logs
		 */
		console.error(`Link failed: ${this.#context.getProgramInfoLog(shader.getProgram())}`);
		console.error(`vs info-log: ${this.#context.getShaderInfoLog(shader.getVertexShader())}`);
		console.error(`fs info-log: ${this.#context.getShaderInfoLog(shader.getFragmentShader())}`);

		this.#context.deleteShader(shader.getVertexShader());
		this.#context.deleteShader(shader.getFragmentShader());
		this.#context.deleteProgram(shader.getProgram());
	}
}