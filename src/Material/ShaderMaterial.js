import {Material} from "./Material.js";

/**
 * @typedef {Object} ShaderMaterialDescriptor
 * @property {String} shaderFilename
 */

export class ShaderMaterial extends Material {
	#shaderFilename;

	/**
	 * @param {ShaderMaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		super();

		this.#shaderFilename = descriptor.shaderFilename;
	}

	getShaderFilename() {
		return this.#shaderFilename;
	}
}