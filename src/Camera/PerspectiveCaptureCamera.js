import {Session} from "../Capture/index.js";
import {NotImplementedError} from "../Error/index.js";
import {PerspectiveCamera} from "./PerspectiveCamera.js";

/**
 * @typedef {Object} PerspectiveCaptureCameraDescriptor
 * @property {?Session} captureSession
 */

export class PerspectiveCaptureCamera extends PerspectiveCamera {
	#captureSession;

	/**
	 * @param {import("./Camera.js").CameraDescriptor & import("./PerspectiveCamera.js").PerspectiveCameraDescriptor & PerspectiveCaptureCameraDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#captureSession = descriptor.captureSession;
	}

	getCaptureSession() {
		return this.#captureSession;
	}

	/**
	 * @param {?Session} captureSession
	 */
	setCaptureSession(captureSession) {
		this.#captureSession = captureSession;
	}

	lookAt() {
		throw new NotImplementedError();

		/* const [yaw, pitch, roll] = this.getRotation();
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

		this.getForward().set(new Vector3(
			rotation[2],
			rotation[5],
			rotation[8],
		));
		this.getRight().set(new Vector3(
			rotation[0],
			rotation[3],
			rotation[6],
		));
		this.getUp().set(new Vector3(
			rotation[1],
			rotation[4],
			rotation[7],
		)); */
	}

	/**
	 * @param {Number} frameIndex
	 */
	readCaptureSession(frameIndex) {
		throw new NotImplementedError();

		/* const frame = this.#captureSession.read(frameIndex);

		if (frame === null) {
			return;
		}

		this.setPosition(frame.getPosition());
		this.setRotation(frame.getRotation()); */
	}
}