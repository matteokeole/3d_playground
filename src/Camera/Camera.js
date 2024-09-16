import {NotImplementedError} from "../Error/index.js";
import {Matrix4, Vector3} from "../math/index.js";
import {Mesh} from "../Mesh/index.js";

/**
 * @typedef {Object} CameraDescriptor
 * @property {Vector3} position
 * @property {?Mesh} hull
 */

/**
 * @abstract
 */
export class Camera {
	#position;
	#view;
	#projection;
	#viewProjection;
	#hull;

	/**
	 * @param {CameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#view = Matrix4.identity();
		this.#projection = Matrix4.identity();
		this.#viewProjection = Matrix4.identity();
		this.#hull = descriptor.hull;
	}

	getPosition() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this.#position.set(position);
	}

	getView() {
		return this.#view;
	}

	/**
	 * @param {Matrix4} view
	 */
	setView(view) {
		this.#view = view;
	}

	getProjection() {
		return this.#projection;
	}

	/**
	 * @param {Matrix4} projection
	 */
	setProjection(projection) {
		this.#projection = projection;
	}

	getViewProjection() {
		return this.#viewProjection;
	}

	/**
	 * @param {Matrix4} viewProjection
	 */
	setViewProjection(viewProjection) {
		this.#viewProjection = viewProjection;
	}

	getHull() {
		return this.#hull;
	}

	/**
	 * @param {?Mesh} hull
	 */
	setHull(hull) {
		this.#hull = hull;
	}

	/**
	 * @abstract
	 */
	update() {
		throw new NotImplementedError();
	}
}