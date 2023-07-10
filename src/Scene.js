import {Mesh} from "./index.js";
import {Vector4} from "./math/index.js";

/** @abstract */
export class Scene {
	/** @type {Mesh[]} */
	meshes = [];

	/** @type {Vector4} */
	background = new Vector4(0, 0, 0, 1);
}