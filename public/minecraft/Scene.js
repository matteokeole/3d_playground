import {Scene as _Scene} from "../../src/index.js";
import {Camera} from "../../src/Camera/index.js";
import {Mesh} from "../../src/Mesh/index.js";

export class Scene extends _Scene {
	/**
	 * @type {?Camera}
	 */
	#pointLight;

	/**
	 * @param {Mesh[]} meshes
	 */
	constructor(meshes) {
		super(meshes);

		this.#pointLight = null;
	}

	getPointLight() {
		return this.#pointLight;
	}

	/**
	 * @param {Camera} pointLight
	 */
	setPointLight(pointLight) {
		this.#pointLight = pointLight;
		this.#pointLight.update();
	}
}