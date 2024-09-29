import {PI, Matrix4, Vector3, rad, quat, conjugate, multiply, normalize} from "../math/index.js";
import {Camera} from "./Camera.js";

/**
 * @typedef {Object} PerspectiveCameraDescriptor
 * @property {Number} [distance]
 * @property {Number} fieldOfView In degrees
 * @property {Number} nearClipPlane
 * @property {Number} farClipPlane
 */

export class PerspectiveCamera extends Camera {
	static #COORDINATE_SYSTEM = 1; // Left-handed coordinate system
	static #DEFAULT_RIGHT = new Vector3(1, 0, 0);
	static #DEFAULT_UP = new Vector3(0, 1, 0);
	static #DEFAULT_FORWARD = new Vector3(0, 0, 1);

	/**
	 * @todo Make configurable
	 */
	static #BIAS = PI * .545;

	#distance;
	#fieldOfView;
	#aspectRatio;
	#nearClipPlane;
	#farClipPlane;

	#orientation;

	#movementAccumulator;
	#rotationAccumulator;

	/**
	 * @param {import("./Camera.js").CameraDescriptor & PerspectiveCameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#distance = descriptor.distance ?? 0;
		this.#fieldOfView = descriptor.fieldOfView;
		this.#aspectRatio = 0;
		this.#nearClipPlane = descriptor.nearClipPlane;
		this.#farClipPlane = descriptor.farClipPlane;

		this.#orientation = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_FORWARD, 0);

		this.#movementAccumulator = new Vector3(0, 0, 0);
		this.#rotationAccumulator = new Vector3(0, 0, 0);
	}

	getDistance() {
		return this.#distance;
	}

	getFieldOfView() {
		return this.#fieldOfView;
	}

	getAspectRatio() {
		return this.#aspectRatio;
	}

	/**
	 * @param {Number} aspectRatio
	 */
	setAspectRatio(aspectRatio) {
		this.#aspectRatio = aspectRatio;
	}

	getNearClipPlane() {
		return this.#nearClipPlane;
	}

	getFarClipPlane() {
		return this.#farClipPlane;
	}

	getOrientation() {
		return this.#orientation;
	}

	getMovementAccumulator() {
		return this.#movementAccumulator;
	}

	getRotationAccumulator() {
		return this.#rotationAccumulator;
	}

	getRight() {
		return multiply(PerspectiveCamera.#DEFAULT_RIGHT, conjugate(this.#orientation));
	}

	getUp() {
		return multiply(PerspectiveCamera.#DEFAULT_UP, conjugate(this.#orientation));
	}

	getForward() {
		return multiply(PerspectiveCamera.#DEFAULT_FORWARD, conjugate(this.#orientation));
	}

	getEye() {
		return new Vector3(this.getPosition()).add(this.getForward().multiplyScalar(-this.#distance));
	}

	/**
	 * @param {Vector3} offset
	 */
	move(offset) {
		this.#movementAccumulator.add(offset);
	}

	/**
	 * @param {Vector3} eulerAngles Assumed to be in radians
	 */
	rotate(eulerAngles) {
		this.#rotationAccumulator.add(eulerAngles);
	}

	update() {
		this.setWorld(this.updateWorld());
		this.setView(this.updateView());
		this.setProjection(this.updateProjection());
		this.setViewProjection(this.updateViewProjection());
	}

	updateWorld() {
		return Matrix4.translation(this.getPosition());
	}

	updateView() {
		///
		/// Rotation
		///

		const pitch = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_RIGHT, this.#rotationAccumulator[0]);
		const yaw = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_UP, this.#rotationAccumulator[1]);
		const roll = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_FORWARD, this.#rotationAccumulator[2]);

		this.#orientation = multiply(this.#orientation, pitch);
		this.#orientation = multiply(yaw, this.#orientation);
		this.#orientation = multiply(this.#orientation, roll);

		this.#orientation = normalize(this.#orientation);

		// Reset accumulator
		this.#rotationAccumulator.set(new Vector3(0, 0, 0));

		const view = Matrix4.fromQuaternion(this.#orientation);

		///
		/// Movement
		///

		let forward = this.getForward();
		let up = this.getUp(); // Not used
		let right = this.getRight();

		/**
		 * @todo TEST
		 */
		{
			const epsilon = 0.0001; // Avoid floating point errors

			if (forward[1] > 1.0 - epsilon) // Note: forward is normalized, so checking Y is sufficent
			{ // Special case: Looking straight up
				forward = new Vector3(up).negate();
			}
			else if (forward[1] < -1.0 + epsilon)
			{ // Special case: Looking straight down
				forward = new Vector3(up);
			}
			else if (right[1] > 1.0 - epsilon)
			{
				right = new Vector3(up);
			}
			else if (right[1] < -1.0 + epsilon)
			{
				right = new Vector3(up).negate();
			}

			// Project the forward and right into the world plane
			forward[1] = 0;
			forward.normalize();

			right[1] = 0;
			right.normalize();

			up = new Vector3(PerspectiveCamera.#DEFAULT_UP);
		}

		forward.multiplyScalar(this.#movementAccumulator[2]);
		up.multiplyScalar(this.#movementAccumulator[1]);
		right.multiplyScalar(this.#movementAccumulator[0]);

		this.getPosition().add(forward);
		this.getPosition().add(up);
		this.getPosition().add(right);

		// Reset accumulator
		this.#movementAccumulator.set(new Vector3(0, 0, 0));

		const translation = multiply(this.getEye().negate(), this.#orientation);

		view.set(translation, 12);

		return view;
	}

	updateProjection() {
		return Matrix4.perspective(
			rad(this.#fieldOfView),
			this.#aspectRatio,
			this.#nearClipPlane,
			this.#farClipPlane,
			PerspectiveCamera.#COORDINATE_SYSTEM,
			PerspectiveCamera.#BIAS,
		);
	}

	updateViewProjection() {
		return new Matrix4(this.getProjection()).multiply(this.getView());
	}
}