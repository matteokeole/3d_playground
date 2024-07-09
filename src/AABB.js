import {Vector3} from "./math/index.js";

export class AABB {
	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	#size;

	/**
	 * @type {Vector3}
	 */
	#halfSize;

	/**
	 * @param {Vector3} position
	 * @param {Vector3} size
	 */
	constructor(position, size) {
		this.#position = position;
		this.#size = size;
		this.#halfSize = new Vector3(size).divideScalar(2);
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

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector3} size
	 */
	setSize(size) {
		this.#size.set(size);
		this.#halfSize.set(size);
		this.#halfSize.divideScalar(2);
	}

	getHalfSize() {
		return this.#halfSize;
	}
}