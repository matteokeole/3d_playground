import {Shader} from "../Shader/index.js";
import {Material} from "./Material.js";

/**
 * @typedef {Object} ShaderMaterialDescriptor
 * @property {Shader} shader
 */

export class ShaderMaterial extends Material {
	#shader;

	/**
	 * @param {ShaderMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super();

		this.#shader = descriptor.shader;
	}

	getShader() {
		return this.#shader;
	}
}