import {ShaderMaterial} from "../../../Material/index.js";
import {WebGLShader} from "../Shader/index.js";

/**
 * @typedef {Object} WebGLShaderMaterialDescriptor
 * @property {WebGLShader} shader
 */

export class WebGLShaderMaterial extends ShaderMaterial {
	#shader;

	/**
	 * @param {WebGLShaderMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#shader = descriptor.shader;
	}

	getShader() {
		return this.#shader;
	}
}