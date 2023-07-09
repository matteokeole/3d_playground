import {AbstractMesh} from "./index.js";
import {Vector4} from "./math/index.js";

/** @abstract */
export class AbstractScene {
	/** @type {AbstractMesh[]} */
	meshes = [];

	/** @type {Vector4} */
	background = new Vector4(0, 0, 0, 1);
}