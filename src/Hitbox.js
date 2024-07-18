import {AABB} from "./index.js";
import {max, min, Vector3} from "./math/index.js";

export class Hitbox {
	/**
	 * @todo Y velocity
	 * 
	 * @param {Hitbox} movingHitbox
	 * @param {Hitbox} staticHitbox
	 * @param {Vector3} normal Will be altered
	 */
	static sweptAabb(movingHitbox, staticHitbox, normal) {
		const movingAabb = movingHitbox.getBroadphaseAabb();
		const staticAabb = staticHitbox.getAabb();
		const entryDistance = new Vector3();
		const exitDistance = new Vector3();

		if (movingHitbox.getVelocity()[0] > 0) {
			entryDistance[0] = staticAabb.getPosition()[0] - (movingAabb.getPosition()[0] + movingAabb.getHalfSize()[0]);
			exitDistance[0] = (staticAabb.getPosition()[0] + (staticAabb.getHalfSize()[0]) - movingAabb.getPosition()[0]);
		} else {
			entryDistance[0] = (staticAabb.getPosition()[0] + (staticAabb.getHalfSize()[0]) - movingAabb.getPosition()[0]);
			exitDistance[0] = staticAabb.getPosition()[0] - (movingAabb.getPosition()[0] + movingAabb.getHalfSize()[0]);
		}

		if (movingHitbox.getVelocity()[2] > 0) {
			entryDistance[2] = staticAabb.getPosition()[2] - (movingAabb.getPosition()[2] + movingAabb.getHalfSize()[2]);
			exitDistance[2] = (staticAabb.getPosition()[2] + (staticAabb.getHalfSize()[2]) - movingAabb.getPosition()[2]);
		} else {
			entryDistance[2] = (staticAabb.getPosition()[2] + (staticAabb.getHalfSize()[2]) - movingAabb.getPosition()[2]);
			exitDistance[2] = staticAabb.getPosition()[2] - (movingAabb.getPosition()[2] + movingAabb.getHalfSize()[2]);
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
	 * @type {AABB}
	 */
	#aabb;

	/**
	 * @type {Vector3}
	 */
	#velocity;

	/**
	 * @param {AABB} aabb
	 */
	constructor(aabb) {
		this.#aabb = aabb;
		this.#velocity = new Vector3();
	}

	getAabb() {
		return this.#aabb;
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

	getBroadphaseAabb() {
		const aabb = this.getAabb();
		const x = aabb.getPosition()[0] + (this.getVelocity()[0] <= 0 ? this.getVelocity()[0] : 0);
		const y = aabb.getPosition()[1];
		const z = aabb.getPosition()[2] + (this.getVelocity()[2] <= 0 ? this.getVelocity()[2] : 0);
		const width = aabb.getSize()[0] + Math.abs(this.getVelocity()[0]);
		const height = aabb.getSize()[1];
		const depth = aabb.getSize()[2] + Math.abs(this.getVelocity()[2]);

		const position = new Vector3(x, y, z);
		const size = new Vector3(width, height, depth);

		return new AABB(position, size);
	}
}