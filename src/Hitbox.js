import {max, min, Vector3} from "./math/index.js";

/**
 * @typedef {Object} HitboxDescriptor
 * @property {Vector3} position
 * @property {Vector3} size
 */

export class Hitbox {
	/**
	 * @todo Y velocity
	 * 
	 * @param {Hitbox} movingHitbox
	 * @param {Hitbox} staticHitbox
	 * @param {Vector3} normal Will be altered
	 */
	static sweptAabb(movingHitbox, staticHitbox, normal) {
		const entryDistance = new Vector3();
		const exitDistance = new Vector3();

		if (movingHitbox.getVelocity()[0] > 0) {
			entryDistance[0] = staticHitbox.getOffset()[0] - (movingHitbox.getOffset()[0] + movingHitbox.getSize()[0]);
			exitDistance[0] = (staticHitbox.getOffset()[0] + (staticHitbox.getSize()[0]) - movingHitbox.getOffset()[0]);
		} else {
			entryDistance[0] = (staticHitbox.getOffset()[0] + (staticHitbox.getSize()[0]) - movingHitbox.getOffset()[0]);
			exitDistance[0] = staticHitbox.getOffset()[0] - (movingHitbox.getOffset()[0] + movingHitbox.getSize()[0]);
		}

		if (movingHitbox.getVelocity()[2] > 0) {
			entryDistance[2] = staticHitbox.getOffset()[2] - (movingHitbox.getOffset()[2] + movingHitbox.getSize()[2]);
			exitDistance[2] = (staticHitbox.getOffset()[2] + (staticHitbox.getSize()[2]) - movingHitbox.getOffset()[2]);
		} else {
			entryDistance[2] = (staticHitbox.getOffset()[2] + (staticHitbox.getSize()[2]) - movingHitbox.getOffset()[2]);
			exitDistance[2] = staticHitbox.getOffset()[2] - (movingHitbox.getOffset()[2] + movingHitbox.getSize()[2]);
		}

		const entry = new Vector3();
		const exit = new Vector3();

		if (movingHitbox.getVelocity()[0] < .001) {
			entry[0] = -Infinity;
			exit[0] = Infinity;
		} else {
			entry[0] = entryDistance[0] / movingHitbox.getVelocity()[0];
			exit[0] = exitDistance[0] / movingHitbox.getVelocity()[0];
		}

		if (movingHitbox.getVelocity()[2] < .001) {
			entry[2] = -Infinity;
			exit[2] = Infinity;
		} else {
			entry[2] = entryDistance[2] / movingHitbox.getVelocity()[2];
			exit[2] = exitDistance[2] / movingHitbox.getVelocity()[2];
		}

		const entryTime = max(entry[0], entry[2]);
		const exitTime = min(exit[0], exit[2]);

		if (
			entryTime > exitTime ||
			(entry[0] < 0 && entry[2] < 0) ||
			entry[0] > 1 ||
			entry[2] > 1
		) {
			// No collision
			return 1;
		}

		// Calculate the collided surface normal
		if (entry[0] > entry[2]) {
			if (entryDistance[0] < 0) {
				normal[0] = 1;
			} else {
				normal[0] = -1;
			}

			normal[2] = 0;
		} else {
			if (entryDistance[2] < 0) {
				normal[2] = 1;
			} else {
				normal[2] = -1;
			}

			normal[0] = 0;
		}

		return entryTime;
	}

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
	#offset;

	/**
	 * @type {Vector3}
	 */
	#velocity;

	/**
	 * @param {HitboxDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#size = descriptor.size;
		this.#velocity = new Vector3();

		this.#updateOffset();
	}

	getPosition() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this.#position = position;

		this.#updateOffset();
	}

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector3} size
	 */
	setSize(size) {
		this.#size = size;

		this.#updateOffset();
	}

	getOffset() {
		return this.#offset;
	}

	#updateOffset() {
		this.#offset = new Vector3(this.#position).subtract(new Vector3(this.#size).divideScalar(2));
	}

	getVelocity() {
		return this.#velocity;
	}

	/**
	 * @param {Vector3} velocity
	 */
	setVelocity(velocity) {
		this.#velocity = velocity;
	}
}