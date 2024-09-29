import {PI, Matrix4, Vector3, rad, quat, conjugate, multiply, normalize} from "../math/index.js";
import {Camera} from "./Camera.js";

/**
 * @typedef {Object} PerspectiveCameraDescriptor
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

	#orientation;

	#fieldOfView;
	#aspectRatio;
	#nearClipPlane;
	#farClipPlane;

	#movementAccumulator;
	#rotationAccumulator;

	/**
	 * @param {import("./Camera.js").CameraDescriptor & PerspectiveCameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#orientation = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_FORWARD, 0);

		this.#fieldOfView = descriptor.fieldOfView;
		this.#aspectRatio = 0;
		this.#nearClipPlane = descriptor.nearClipPlane;
		this.#farClipPlane = descriptor.farClipPlane;

		this.#movementAccumulator = new Vector3(0, 0, 0);
		this.#rotationAccumulator = new Vector3(0, 0, 0);
	}

	getOrientation() {
		return this.#orientation;
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

	getRight() {
		return multiply(PerspectiveCamera.#DEFAULT_RIGHT, conjugate(this.#orientation));
	}

	getUp() {
		return multiply(PerspectiveCamera.#DEFAULT_UP, conjugate(this.#orientation));
	}

	getForward() {
		return multiply(PerspectiveCamera.#DEFAULT_FORWARD, conjugate(this.#orientation));
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

	/**
	 * @param {Vector3} velocity
	 */
	applyVelocity(velocity) {
		throw new Error("deprecated");
		// const xAmount = PerspectiveCamera.#UP.cross(this.#forward).normalize().multiplyScalar(velocity[0]);
		// const zAmount = new Vector3(this.#forward).multiplyScalar(velocity[2]);

		// this.getPosition().add(xAmount).add(zAmount);
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
		// Rotation

		const pitch = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_RIGHT, this.#rotationAccumulator[0]);
		const yaw = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_UP, this.#rotationAccumulator[1]);
		const roll = quat.fromAxisAngle(PerspectiveCamera.#DEFAULT_FORWARD, this.#rotationAccumulator[2]);

		this.#orientation = multiply(this.#orientation, pitch);
		this.#orientation = multiply(yaw, this.#orientation);
		this.#orientation = multiply(this.#orientation, roll);

		this.#orientation = normalize(this.#orientation);

		// Reset accumulator
		this.#rotationAccumulator.set(new Vector3(0, 0, 0));

		const viewMatrix = Matrix4.fromQuaternion(this.#orientation);

		// Movement

		const forward = this.getForward().multiplyScalar(this.#movementAccumulator[2]);
		const up = this.getUp().multiplyScalar(this.#movementAccumulator[1]);
		const right = this.getRight().multiplyScalar(this.#movementAccumulator[0]);

		this.getPosition().add(forward);
		this.getPosition().add(up);
		this.getPosition().add(right);

		// Reset accumulator
		this.#movementAccumulator.set(new Vector3(0, 0, 0));

		const translation = multiply(new Vector3(this.getPosition()).negate(), this.#orientation);

		viewMatrix.set(translation, 12);

		return viewMatrix;
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