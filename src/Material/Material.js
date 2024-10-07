import {Shader} from "../Shader/index.js";

/**
 * @typedef {Object} MaterialDescriptor
 * @property {Shader} shader
 */

export class Material {
	#shader;
	#uniforms;

	/**
	 * @param {MaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#shader = descriptor.shader;
		this.#uniforms = {};
	}

	getShader() {
		return this.#shader;
	}

	getUniforms() {
		return this.#uniforms;
	}

	/**
	 * @param {String} name
	 */
	getUniform(name) {
		return this.#uniforms[name];
	}

	/**
	 * @param {String} name
	 * @param {Object} value
	 */
	setUniform(name, value) {
		this.#uniforms[name] = value;
	}
}