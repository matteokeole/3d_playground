import {max, min, Vector3} from "./math/index.js";

/**
 * @typedef {Object} HitboxDescriptor
 * @property {Vector3} position
 * @property {Vector3} size
 */

export class Hitbox {
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
	#velocity;

	/**
	 * @param {HitboxDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#size = descriptor.size;
		this.#velocity = new Vector3();
	}

	getPosition() {
		return this.#position;
	}

	/**
	 * @param {Vector3} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector3} size
	 */
	setSize(size) {
		this.#size = size;
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

	/**
	 * @param {Hitbox} that
	 * @param {Hitbox} hitbox
	 * @param {Vector3} normal
	 */
	static __sweptAABB_old(that, hitbox, normal) {
		const invEntry = new Vector3();
		const invExit = new Vector3();
		const entry = new Vector3();
		const exit = new Vector3();
		const [x1, y1, z1] = that.getPosition();
		const [x2, y2, z2] = hitbox.getPosition();
		const [w1, h1, d1] = new Vector3(that.getSize()).multiplyScalar(.5);
		const [w2, h2, d2] = new Vector3(hitbox.getSize()).multiplyScalar(.5);
		const [vx1, vy1, vz1] = that.getVelocity();

		const negativeZ1 = z1 - d1;
		const positiveZ1 = z1 + d1;
		const negativeZ2 = z2 - d2;
		const positiveZ2 = z2 + d2;

		if (vz1 > 0) {
			invEntry[2] = negativeZ2 - positiveZ1;
			invExit[2] = positiveZ2 - negativeZ1;
		} else {
			invEntry[2] = positiveZ2 - negativeZ1;
			invExit[2] = negativeZ2 - positiveZ1;
		}

		if (vz1 === 0) {
			entry[2] = -Infinity;
			exit[2] = Infinity;
		} else {
			entry[2] = invEntry[2] / vz1;
			exit[2] = invExit[2] / vz1;
		}

		const entryTime = entry[2];
		const exitTime = exit[2];

		if (
			entryTime > exitTime ||
			(entry[2] < 0) ||
			(entry[2] > 1)
		) {
			// No collision
			normal.multiplyScalar(0);

			return 1;
		}

		if (invEntry[2] < 0) {
			normal[2] = 1;
		} else {
			normal[2] = -1;
		}

		return entryTime;
	}

	/**
	 * @todo Y velocity
	 * 
	 * @param {Hitbox} movingHitbox
	 * @param {Hitbox} staticHitbox
	 * @param {Vector3} normal Will be altered
	 */
	static sweptAabb(movingHitbox, staticHitbox, normal) {
		const invEntry = new Vector3();
		const invExit = new Vector3();

		if (movingHitbox.getVelocity()[0] > 0) {
			invEntry[0] = staticHitbox.getPosition()[0] - (movingHitbox.getPosition()[0] + movingHitbox.getSize()[0]);
			invExit[0] = (staticHitbox.getPosition()[0] + (staticHitbox.getSize()[0]) - movingHitbox.getPosition()[0]);
		} else {
			invEntry[0] = (staticHitbox.getPosition()[0] + (staticHitbox.getSize()[0]) - movingHitbox.getPosition()[0]);
			invExit[0] = staticHitbox.getPosition()[0] - (movingHitbox.getPosition()[0] + movingHitbox.getSize()[0]);
		}

		if (movingHitbox.getVelocity()[2] > 0) {
			invEntry[2] = staticHitbox.getPosition()[2] - (movingHitbox.getPosition()[2] + movingHitbox.getSize()[2]);
			invExit[2] = (staticHitbox.getPosition()[2] + (staticHitbox.getSize()[2]) - movingHitbox.getPosition()[2]);
		} else {
			invEntry[2] = (staticHitbox.getPosition()[2] + (staticHitbox.getSize()[2]) - movingHitbox.getPosition()[2]);
			invExit[2] = staticHitbox.getPosition()[2] - (movingHitbox.getPosition()[2] + movingHitbox.getSize()[2]);
		}

		const entry = new Vector3();
		const exit = new Vector3();

		if (movingHitbox.getVelocity()[0] === 0) {
			entry[0] = -Infinity;
			exit[0] = Infinity;
		} else {
			entry[0] = invEntry[0] / movingHitbox.getVelocity()[0];
			exit[0] = invExit[0] / movingHitbox.getVelocity()[0];
		}

		if (movingHitbox.getVelocity()[2] === 0) {
			entry[2] = -Infinity;
			exit[2] = Infinity;
		} else {
			entry[2] = invEntry[2] / movingHitbox.getVelocity()[2];
			exit[2] = invExit[2] / movingHitbox.getVelocity()[2];
		}

		const entryTime = max(entry[0], entry[2]);
		const exitTime = min(exit[0], exit[2]);

		if (
			entryTime > exitTime ||
			(entry[0] < 0 && entry[2] < 1) ||
			entry[0] > 1 ||
			entry[2] > 1
		) {
			return 1;
		}

		// Calculate the collided surface normal
		if (entry[0] > entry[2]) {
			if (invEntry[0] < 0) {
				normal[0] = 1;
			} else {
				normal[0] = -1;
			}

			normal[2] = 0;
		} else {
			if (invEntry[2] < 0) {
				normal[2] = 1;
			} else {
				normal[2] = -1;
			}

			normal[0] = 0;
		}

		return entryTime;
	}
}