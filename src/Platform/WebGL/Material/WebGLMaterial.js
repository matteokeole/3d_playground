import {Material} from "../../../Material/index.js";
import {WebGLShader} from "../Shader/index.js";

/**
 * @typedef {Object} WebGLMaterialDescriptor
 * @property {WebGLShader} shader
 */

export class WebGLMaterial extends Material {
	#shader;

	/**
	 * @param {WebGLMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#shader = descriptor.shader;
	}

	getShader() {
		return this.#shader;
	}
}