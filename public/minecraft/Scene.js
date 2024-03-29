import {Camera, Mesh, Scene as _Scene} from "../../src/index.js";
import {Material} from "../../src/materials/index.js";

export class Scene extends _Scene {
	/**
	 * @type {?Camera}
	 */
	#pointLight;

	/**
	 * @param {Mesh[]} meshes
	 * @param {Material[]} [materials]
	 */
	constructor(meshes, materials) {
		super(meshes, materials);

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