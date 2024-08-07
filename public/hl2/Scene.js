import {Scene as _Scene} from "../../src/index.js";
import {PointLight} from "../../src/Light/index.js";
import {Matrix4, Vector3} from "../../src/math/index.js";
import {Mesh} from "../../src/Mesh/index.js";

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
	 */
	constructor(meshes) {
		super(meshes);

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
			new Vector3(this.#pointLight.position).add(this.#pointLight.direction),
			new Vector3(0, 1, 0),
		);

		this.#pointLightSpace = pointLightProjection.multiply(pointLightView);
	}

	getPointLightSpace() {
		return this.#pointLightSpace;
	}
}