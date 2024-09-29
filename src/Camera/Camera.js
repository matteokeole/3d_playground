import {NotImplementedError} from "../Error/index.js";
import {Geometry} from "../Geometry/index.js";
import {Matrix4, Vector3} from "../math/index.js";

/**
 * @typedef {Object} CameraDescriptor
 * @property {Vector3} position
 * @property {Geometry} [proxyGeometry]
 */

/**
 * @abstract
 */
export class Camera {
	#position;
	#world;
	#view;
	#projection;
	#viewProjection;

	/**
	 * @param {CameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#world = Matrix4.identity();
		this.#view = Matrix4.identity();
		this.#projection = Matrix4.identity();
		this.#viewProjection = Matrix4.identity();
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

	getWorld() {
		return this.#world;
	}

	/**
	 * @param {Matrix4} world
	 */
	setWorld(world) {
		this.#world = world;
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

	/**
	 * @abstract
	 */
	update() {
		throw new NotImplementedError();
	}
}