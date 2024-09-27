import {NotImplementedError} from "../Error/index.js";
import {Hull} from "../Hull/index.js";
import {Matrix4, Vector3} from "../math/index.js";

/**
 * @typedef {Object} CameraDescriptor
 * @property {Vector3} position
 * @property {Hull} [hull]
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
	#hull;

	/**
	 * @param {CameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#world = Matrix4.identity();
		this.#view = Matrix4.identity();
		this.#projection = Matrix4.identity();
		this.#viewProjection = Matrix4.identity();
		this.#hull = descriptor.hull ?? null;
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

	getWorld() {
		return this.#world;
	}

	/**
	 * @param {Matrix4} world
	 */
	setWorld(world) {
		this.#world = world;
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
	 * @abstract
	 */
	update() {
		throw new NotImplementedError();
	}
}