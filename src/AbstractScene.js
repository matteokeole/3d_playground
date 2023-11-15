import {AbstractMesh} from "./index.js";
import {AbstractLight} from "./lights/index.js";
import {Vector4} from "./math/index.js";

/**
 * @abstract
 */
export class AbstractScene {
	/**
	 * @type {AbstractMesh[]}
	 */
	meshes = [];

	/**
	 * @type {AbstractLight[]}
	 */
	lights = [];

	/**
	 * @deprecated
	 * @type {Vector4}
	 */
	background = new Vector4(0, 0, 0, 1);
}