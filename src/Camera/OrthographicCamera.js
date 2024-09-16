import {Matrix4} from "../math/index.js";
import {Camera} from "./Camera.js";

/**
 * @typedef {Object} OrthographicCameraDescriptor
 * @property {Number} left
 * @property {Number} right
 * @property {Number} bottom
 * @property {Number} top
 * @property {Number} near
 * @property {Number} far
 */

export class OrthographicCamera extends Camera {
	/**
	 * @param {import("./Camera.js").CameraDescriptor & OrthographicCameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#updateProjection(descriptor.left, descriptor.right, descriptor.bottom, descriptor.top, descriptor.near, descriptor.far);
	}

	update() {
		this.#updateView();
		this.#updateViewProjection();
	}

	#updateView() {
		const invertTranslation = Matrix4.translation(this.getPosition()).invert();

		this.setView(invertTranslation);
	}

	/**
	 * @param {Number} left
	 * @param {Number} right
	 * @param {Number} bottom
	 * @param {Number} top
	 * @param {Number} near
	 * @param {Number} far
	 */
	#updateProjection(left, right, bottom, top, near, far) {
		const projection = Matrix4.orthographic(left, right, bottom, top, near, far);

		this.setProjection(projection);
	}

	#updateViewProjection() {
		const viewProjection = new Matrix4(this.getProjection()).multiply(this.getView());

		this.setViewProjection(viewProjection);
	}
}