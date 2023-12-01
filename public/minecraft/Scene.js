import {Mesh, Scene as _Scene} from "../../src/index.js";
import {PointLight} from "../../src/lights/index.js";
import {Material} from "../../src/materials/index.js";
import {Matrix4, Vector3} from "../../src/math/index.js";

export class Scene extends _Scene {
	/**
	 * @type {?PointLight}
	 */
	#pointLight;

	/**
	 * @type {?Matrix4}
	 */
	#pointLightSpace;

	/**
	 * @param {Mesh[]} meshes
	 * @param {Material[]} [materials]
	 */
	constructor(meshes, materials) {
		super(meshes, materials);

		this.#pointLight = null;
		this.#pointLightSpace = null;
	}

	getPointLight() {
		return this.#pointLight;
	}

	/**
	 * @param {PointLight} pointLight
	 */
	setPointLight(pointLight) {
		this.#pointLight = pointLight;

		const pointLightProjection = Matrix4.perspective(90, 16 / 9, 1, 100, 1);
		const pointLightView = Matrix4.lookAt(
			this.#pointLight.position,
			this.#pointLight.position.clone().add(this.#pointLight.direction),
			new Vector3(0, 1, 0),
		);

		this.#pointLightSpace = pointLightProjection.multiply(pointLightView);
	}

	getPointLightSpace() {
		return this.#pointLightSpace;
	}
}