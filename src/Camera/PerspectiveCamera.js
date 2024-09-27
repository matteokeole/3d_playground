import {PI, Matrix4, Vector3, rad, clamp} from "../math/index.js";
import {Camera} from "./Camera.js";

/**
 * @typedef {Object} PerspectiveCameraDescriptor
 * @property {Number} fieldOfView In degrees
 * @property {Number} nearClipPlane
 * @property {Number} farClipPlane
 */

export class PerspectiveCamera extends Camera {
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
	#yaw;
	#pitch;

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
		this.#yaw = 90;
		this.#pitch = 0;

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

	getForward() {
		return this.#forward;
	}

	getYaw() {
		return this.#yaw;
	}

	getPitch() {
		return this.#pitch;
	}

	/**
	 * @param {Vector3} velocity
	 */
	applyVelocity(velocity) {
		const xAmount = PerspectiveCamera.#UP.cross(this.#forward).normalize().multiplyScalar(velocity[0]);
		const zAmount = new Vector3(this.#forward).multiplyScalar(velocity[2]);

		this.getPosition().add(xAmount).add(zAmount);
	}

	/**
	 * @param {Number} yawOffset
	 * @param {Number} pitchOffset
	 */
	applyYawAndPitch(yawOffset, pitchOffset) {
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
		this.#updateWorld();
		this.#updateView();
		this.#updateProjection();
		this.#updateViewProjection();

		if (this.getHull()) {
			this.getHull().setWorld(this.getWorld());
		}
	}

	#updateWorld() {
		const world = Matrix4.translation(this.getPosition());

		this.setWorld(world);
	}

	#updateView() {
		const view = Matrix4.lookAtRelative(this.getPosition(), this.#forward, PerspectiveCamera.#UP);

		this.setView(view);
	}

	#updateProjection() {
		const projection = Matrix4.perspective(
			this.#fieldOfViewRad,
			this.#aspectRatio,
			this.#nearClipPlane,
			this.#farClipPlane,
			PerspectiveCamera.#COORDINATE_SYSTEM,
			PerspectiveCamera.#BIAS,
		);

		this.setProjection(projection);
	}

	#updateViewProjection() {
		const viewProjection = new Matrix4(this.getProjection()).multiply(this.getView());

		this.setViewProjection(viewProjection);
	}
}