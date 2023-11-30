import {clamp, Matrix3, Matrix4, PI, Vector2, Vector3} from "./math/index.js";

/**
 * @abstract
 */
export class Camera {
	/**
	 * @param {Number} yaw
	 * @param {Number} pitch
	 * @returns {Vector3}
	 */
	static #sphericalToCartesian(yaw, pitch) {
		return new Vector3(
			Math.cos(pitch) * Math.sin(yaw),
			Math.sin(pitch),
			Math.cos(pitch) * Math.cos(yaw),
		);
	}

	/**
	 * @type {Matrix4}
	 */
	#projection;

	/**
	 * @type {Matrix4}
	 */
	#view;

	/**
	 * @type {Matrix4}
	 */
	#viewProjection;

	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Vector3}
	 */
	target;

	/**
	 * @type {Vector3}
	 */
	#distance;

	/**
	 * @type {Vector3}
	 */
	#rotation;

	/**
	 * @type {Vector3}
	 */
	#forward;

	/**
	 * @type {Vector3}
	 */
	#right;

	/**
	 * @type {Vector3}
	 */
	#up;

	/**
	 * @type {Number}
	 */
	fieldOfView;

	/**
	 * @type {Number}
	 */
	aspectRatio;

	/**
	 * @type {Number}
	 */
	near;

	/**
	 * @type {Number}
	 */
	far;

	/**
	 * @type {Number}
	 */
	bias;

	/**
	 * @type {Number}
	 */
	turnVelocity;

	constructor() {
		this.#projection = new Matrix4();
		this.#view = new Matrix4();
		this.#viewProjection = new Matrix4();
		this.#position = new Vector3();
		this.target = new Vector3();
		this.#distance = new Vector3();
		this.#rotation = new Vector3();
		this.#forward = new Vector3(0, 0, 1);
		this.#right = new Vector3(1, 0, 0);
		this.#up = new Vector3(0, 1, 0);
		this.fieldOfView = 0;
		this.aspectRatio = 0;
		this.near = 0;
		this.far = 0;
		this.bias = 0;
		this.turnVelocity = 0;
	}

	getProjection() {
		return this.#projection;
	}

	getView() {
		return this.#view;
	}

	getViewProjection() {
		return this.#viewProjection;
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

	getRotation() {
		return this.#rotation;
	}

	/**
	 * @param {Vector3} rotation
	 */
	setRotation(rotation) {
		this.#rotation.set(rotation);
	}

	getDistance() {
		return this.#distance;
	}

	/**
	 * @param {Vector3} distance
	 */
	setDistance(distance) {
		this.#distance.set(distance);
	}

	getForward() {
		return this.#forward;
	}

	getRight() {
		return this.#right;
	}

	getUp() {
		return this.#up;
	}

	/**
	 * @param {Number} x
	 */
	truck(x) {
		const right = this.#right.clone();

		this.target.add(right.multiplyScalar(x));
	}

	/**
	 * @param {Number} y
	 */
	pedestal(y) {
		const up = this.#up.clone();

		this.target.add(up.multiplyScalar(y));
	}

	/**
	 * @param {Number} z
	 */
	dolly(z) {
		const forward = this.#forward.clone();

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
		const newForward = this.#right.cross(new Vector3(0, 1, 0));

		this.target.add(newForward.multiplyScalar(z));
	}

	/**
	 * Note: Only yaw and pitch
	 * 
	 * @param {Vector2} delta
	 */
	lookAt(delta) {
		delta.multiplyScalar(this.turnVelocity);

		const newPitch = -delta[1];
		const newYaw = delta[0];

		this.#rotation[0] = clamp(this.#rotation[0] + newPitch, -PI * .5, PI * .5);
		if (this.#rotation[1] + newYaw > PI) this.#rotation[1] = -PI;
		if (this.#rotation[1] + newYaw < -PI) this.#rotation[1] = PI;
		this.#rotation[1] += newYaw;

		const pitch = this.#rotation[0];
		const yaw = this.#rotation[1];

		this.forward = Camera.#sphericalToCartesian(yaw, pitch);
		this.right = Camera.#sphericalToCartesian(yaw + PI * .5, 0);
		this.up = this.forward.cross(this.right);
	};

	captureLookAt() {
		const [yaw, pitch, roll] = this.#rotation;

		const yawRotation = new Matrix3(
			Math.cos(yaw), 0, Math.sin(yaw),
			0, 1, 0,
			-Math.sin(yaw), 0, Math.cos(yaw),
		);

		const pitchRotation = new Matrix3(
			1, 0, 0,
			0, Math.cos(pitch), -Math.sin(pitch),
			0, Math.sin(pitch), Math.cos(pitch),
		);

		const rollRotation = new Matrix3(
			Math.cos(roll), -Math.sin(roll), 0,
			Math.sin(roll), Math.cos(roll), 0,
			0, 0, 1,
		);

		const rotation = rollRotation.multiply(pitchRotation).multiply(yawRotation);

		this.forward = new Vector3(
			rotation[2],
			rotation[5],
			rotation[8],
		);

		this.right = new Vector3(
			rotation[0],
			rotation[3],
			rotation[6],
		);

		this.up = new Vector3(
			rotation[1],
			rotation[4],
			rotation[7],
		);
	}

	update() {
		this.#projection = Matrix4.perspective(
			this.fieldOfView * PI / 180,
			this.aspectRatio,
			this.near,
			this.far,
			1,
			this.bias,
		).multiply(Matrix4.translation(this.#distance.clone().multiplyScalar(-1)));
		this.#view = Matrix4.lookAt(
			this.#position,
			this.#position.clone().add(this.#forward),
			this.#up,
		);
		this.#viewProjection = this.#projection.clone().multiply(this.#view);
	}

	/**
	 * Returns the current camera position, including the distance.
	 * 
	 * @returns {Vector3}
	 */
	getPhysicalPosition() {
		const position = this.#position.clone();

		const xDistance = new Vector3(
			Math.cos(this.#rotation[1]),
			0,
			-Math.sin(this.#rotation[1]),
		).multiplyScalar(this.#distance[0]);
		const yDistance = new Vector3(1, this.#distance[1], 1);
		const zDistance = new Vector3(
			Math.sin(this.#rotation[1]),
			0,
			Math.cos(this.#rotation[1]),
		).multiplyScalar(this.#distance[2]);

		return position.add(xDistance).add(yDistance).add(zDistance);
	}
}