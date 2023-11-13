import {clamp, Matrix4, PI, Vector2, Vector3} from "./math/index.js";

/**
 * @abstract
 */
export class AbstractCamera {
	/**
	 * @type {Matrix4}
	 */
	#projection = new Matrix4();

	/**
	 * @type {Matrix4}
	 */
	#view = new Matrix4();

	/**
	 * @type {Vector3}
	 */
	position = new Vector3();

	/**
	 * @type {Vector3}
	 */
	target = new Vector3();

	/**
	 * @type {Vector3}
	 */
	#distance;

	/**
	 * @type {Vector3}
	 */
	rotation = new Vector3();

	/**
	 * @type {Vector3}
	 */
	forward = new Vector3(0, 0, 1);

	/**
	 * @type {Vector3}
	 */
	right = new Vector3(1, 0, 0);

	/**
	 * @type {Vector3}
	 */
	up = new Vector3(0, 1, 0);

	/**
	 * @type {Number}
	 */
	fieldOfView = 0;

	/**
	 * @type {Number}
	 */
	aspectRatio = 0;

	/**
	 * @type {Number}
	 */
	near = 0;

	/**
	 * @type {Number}
	 */
	far = 0;

	/**
	 * @type {Number}
	 */
	bias = 0;

	/**
	 * @type {Number}
	 */
	turnVelocity = 0;

	/**
	 * @type {Number}
	 */
	lerpFactor = 1;

	constructor() {
		this.#distance = new Vector3();
	}

	/**
	 * @returns {Matrix4}
	 */
	get projection() {
		return this.#projection;
	}

	/**
	 * @returns {Matrix4}
	 */
	get view() {
		return this.#view;
	}

	/**
	 * @param {Vector3} distance
	 */
	setDistance(distance) {
		this.#distance = distance;
	}

	/**
	 * @param {Number} x
	 */
	truck(x) {
		const right = this.right.clone();

		this.target.add(right.multiplyScalar(x));
	}

	/**
	 * @param {Number} y
	 */
	pedestal(y) {
		const up = this.up.clone();

		this.target.add(up.multiplyScalar(y));
	}

	/**
	 * @param {Number} z
	 */
	dolly(z) {
		const forward = this.forward.clone();

		this.target.add(forward.multiplyScalar(z));
	}

	/**
	 * @param {Number} y
	 */
	moveY(y) {
		this.target[1] += y;
	}

	/**
	 * @param {Number} z
	 */
	moveZ(z) {
		const newForward = this.right.cross(new Vector3(0, 1, 0));

		this.target.add(newForward.multiplyScalar(z));
	}

	/**
	 * @param {Vector2} delta
	 */
	lookAt(delta) {
		delta.multiplyScalar(this.turnVelocity);

		const newPitch = -delta[1];
		const newYaw = delta[0];

		this.rotation[0] = clamp(this.rotation[0] + newPitch, -PI * .5, PI * .5);
		if (this.rotation[1] + newYaw > PI) this.rotation[1] = -PI;
		if (this.rotation[1] + newYaw < -PI) this.rotation[1] = PI;
		this.rotation[1] += newYaw;

		const pitch = this.rotation[0];
		const yaw = this.rotation[1];

		this.forward = sphericalToCartesian(yaw, pitch);
		this.right = sphericalToCartesian(yaw + PI * .5, 0);
		this.up = this.forward.cross(this.right);
	};

	update() {
		this.#projection = Matrix4.perspective(
			this.fieldOfView * PI / 180,
			this.aspectRatio,
			this.near,
			this.far,
			1,
		).multiply(Matrix4.translation(this.#distance.clone().multiplyScalar(-1)));

		this.#view = Matrix4.lookAt(
			this.position,
			this.position.clone().add(this.forward),
			this.up,
		);
	}

	/**
	 * Returns the current camera position, including the distance.
	 * 
	 * @returns {Vector3}
	 */
	getPhysicalPosition() {
		const position = this.position.clone();

		const xDistance = new Vector3(
			Math.cos(this.rotation[1]),
			0,
			-Math.sin(this.rotation[1]),
		).multiplyScalar(this.#distance[0]);
		const yDistance = new Vector3(1, this.#distance[1], 1);
		const zDistance = new Vector3(
			Math.sin(this.rotation[1]),
			0,
			Math.cos(this.rotation[1]),
		).multiplyScalar(this.#distance[2]);

		return position.add(xDistance).add(yDistance).add(zDistance);
	}
}

/**
 * @param {Number} yaw
 * @param {Number} pitch
 * @returns {Vector3}
 */
const sphericalToCartesian = (yaw, pitch) => new Vector3(
	Math.cos(pitch) * Math.sin(yaw),
	Math.sin(pitch),
	Math.cos(pitch) * Math.cos(yaw),
);