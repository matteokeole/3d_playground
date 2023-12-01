import {Mesh, Scene as _Scene} from "../../src/index.js";
import {DirectionalLight} from "../../src/lights/index.js";
import {Material} from "../../src/materials/index.js";

export class Scene extends _Scene {
	/**
	 * @type {DirectionalLight}
	 */
	#directionalLight;

	/**
	 * @param {Mesh[]} meshes
	 * @param {Material[]} [materials]
	 */
	constructor(meshes, materials) {
		super(meshes, materials);

		this.#directionalLight = null;
	}

	getDirectionalLight() {
		return this.#directionalLight;
	}

	/**
	 * @param {DirectionalLight} directionalLight
	 */
	setDirectionalLight(directionalLight) {
		this.#directionalLight = directionalLight;
	}
}