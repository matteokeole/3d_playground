import {PI, Matrix4, Vector3, rad, quat, cos, sin, conjugate, multiply, normalize} from "../math/index.js";
import {Camera} from "./Camera.js";

/**
 * @typedef {Object} PerspectiveCameraDescriptor
 * @property {Number} fieldOfView In degrees
 * @property {Number} nearClipPlane
 * @property {Number} farClipPlane
 */

export class PerspectiveCamera extends Camera {
	static #WORLD_RIGHT = new Vector3(1, 0, 0);
	static #WORLD_UP = new Vector3(0, 1, 0);
	static #WORLD_FORWARD = new Vector3(0, 0, 1);

	static #COORDINATE_SYSTEM = 1; // Left-handed
	static #UP = new Vector3(0, 1, 0);

	/**
	 * @todo Make configurable
	 */
	static #BIAS = PI * .545;

	#fieldOfView;
	#aspectRatio;
	#nearClipPlane;
	#farClipPlane;

	#forward;
	#right;
	#yaw;
	#pitch;

	#orientation;

	#movementAccumulator;
	#rotationAccumulator;

	#fieldOfViewRad;
	#yawRad;
	#pitchRad;

	/**
	 * @param {import("./Camera.js").CameraDescriptor & PerspectiveCameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#fieldOfView = descriptor.fieldOfView;
		this.#aspectRatio = 0; // Needs to be setup later
		this.#nearClipPlane = descriptor.nearClipPlane;
		this.#farClipPlane = descriptor.farClipPlane;

		this.#forward = new Vector3(0, 0, 1);
		this.#right = new Vector3(1, 0, 0);
		this.#yaw = 90;
		this.#pitch = 0;

		this.#orientation = quat.fromAxisAngle(PerspectiveCamera.#WORLD_FORWARD, 0);

		this.#movementAccumulator = new Vector3(0, 0, 0);
		this.#rotationAccumulator = new Vector3(0, 0, 0);

		this.#fieldOfViewRad = rad(this.#fieldOfView);
		this.#yawRad = rad(this.#yaw);
		this.#pitchRad = rad(this.#pitch);
	}

	getFieldOfView() {
		return this.#fieldOfView;
	}

	/**
	 * @param {Number} fieldOfView
	 */
	setFieldOfView(fieldOfView) {
		this.#fieldOfView = fieldOfView;
		this.#fieldOfViewRad = rad(this.#fieldOfView);
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

	/**
	 * @param {Number} nearClipPlane
	 */
	setNearClipPlane(nearClipPlane) {
		this.#nearClipPlane = nearClipPlane;
	}

	getFarClipPlane() {
		return this.#farClipPlane;
	}

	/**
	 * @param {Number} farClipPlane
	 */
	setFarClipPlane(farClipPlane) {
		this.#farClipPlane = farClipPlane;
	}

	getRight() {
		return multiply(PerspectiveCamera.#WORLD_RIGHT, conjugate(this.#orientation));
	}

	getUp() {
		return multiply(PerspectiveCamera.#WORLD_UP, conjugate(this.#orientation));
	}

	getForward() {
		return multiply(PerspectiveCamera.#WORLD_FORWARD, conjugate(this.#orientation));
	}

	getOrientation() {
		return this.#orientation;
	}

	/**
	 * @param {quat} orientation
	 */
	setOrientation(orientation) {
		this.#orientation = orientation;
	}

	/**
	 * @param {Vector3} offset
	 */
	move(offset) {
		this.#movementAccumulator.add(offset);
	}

	/**
	 * @param {Vector3} angles
	 */
	rotate(angles) {
		this.#rotationAccumulator.add(angles);
	}

	/**
	 * @param {Vector3} velocity
	 */
	applyVelocity(velocity) {
		debugger;
		const xAmount = PerspectiveCamera.#UP.cross(this.#forward).normalize().multiplyScalar(velocity[0]);
		const zAmount = new Vector3(this.#forward).multiplyScalar(velocity[2]);

		this.getPosition().add(xAmount).add(zAmount);
	}

	/**
	 * @param {Number} yawOffset
	 * @param {Number} pitchOffset
	 */
	applyYawAndPitch(yawOffset, pitchOffset) {
		debugger;
		this.#yaw += yawOffset;
		this.#pitch += pitchOffset;

		if (this.#yaw < 0) {
			this.#yaw = 360;
		}

		if (this.#yaw > 360) {
			this.#yaw = 0;
		}

		if (this.#pitch < -90) {
			this.#pitch = -90;
		}

		if (this.#pitch > 90) {
			this.#pitch = 90;
		}

		this.#yawRad = rad(this.#yaw);
		this.#pitchRad = rad(this.#pitch);

		this.#forward[0] = Math.cos(this.#yawRad) * Math.cos(this.#pitchRad);
		this.#forward[1] = Math.sin(this.#pitchRad);
		this.#forward[2] = Math.sin(this.#yawRad) * Math.cos(this.#pitchRad);
		this.#forward.normalize();
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

		const pitch = quat.fromAxisAngle(PerspectiveCamera.#WORLD_RIGHT, this.#rotationAccumulator[0]);
		const yaw = quat.fromAxisAngle(PerspectiveCamera.#WORLD_UP, this.#rotationAccumulator[1]);
		// const roll = quat.fromAxisAngle(PerspectiveCamera.#WORLD_FORWARD, this.#rotationAccumulator[2]);

		this.#orientation = multiply(this.#orientation, pitch);
		this.#orientation = multiply(yaw, this.#orientation);
		// this.#orientation = multiply(this.#orientation, roll);

		this.#orientation = normalize(this.#orientation);

		this.#rotationAccumulator[0] = 0;
		this.#rotationAccumulator[1] = 0;
		this.#rotationAccumulator[2] = 0;

		const viewMatrix = Matrix4.fromQuaternion(this.#orientation);

		// Movement

		const forward = this.getForward();
		forward.multiplyScalar(this.#movementAccumulator[0]);

		const up = this.getUp();
		up.multiplyScalar(this.#movementAccumulator[1]);

		const right = this.getRight();
		right.multiplyScalar(this.#movementAccumulator[2]);

		this.getPosition().add(forward);
		this.getPosition().add(up);
		this.getPosition().add(right);

		this.#movementAccumulator[0] = 0;
		this.#movementAccumulator[1] = 0;
		this.#movementAccumulator[2] = 0;

		const translation = multiply(new Vector3(this.getPosition()).negate(), this.#orientation);

		viewMatrix[12] = translation[0];
		viewMatrix[13] = translation[1];
		viewMatrix[14] = translation[2];

		return viewMatrix;
		// return Matrix4.lookAt(this.getPosition(), new Vector3(this.getPosition()).add(this.#forward), PerspectiveCamera.#UP);
	}

	updateProjection() {
		return Matrix4.perspective(
			this.#fieldOfViewRad,
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