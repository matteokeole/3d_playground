import {Camera as _Camera} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {Session} from "../../src/Capture/index.js";

export class Camera extends _Camera {
	/**
	 * @type {?Session}
	 */
	#captureSession;

	constructor() {
		super();

		this.#captureSession = null;
	}

	getCaptureSession() {
		return this.#captureSession;
	}

	/**
	 * @param {Session} captureSession
	 */
	setCaptureSession(captureSession) {
		this.#captureSession = captureSession;
	}

	/**
	 * @param {Number} frameIndex
	 */
	readCaptureSession(frameIndex) {
		const frame = this.#captureSession.read(frameIndex);

		if (frame === null) {
			return;
		}

		this.setPosition(frame.getPosition());
		this.rotation = frame.getRotation();
	}

	/**
	 * @param {Vector3} velocity
	 */
	getRelativeVelocity(velocity) {
		const right = this
			.getRight()
			.clone()
			.multiplyScalar(velocity[0]);
		const up = new Vector3(0, velocity[1], 0);
		const forward = this
			.getRight()
			.cross(new Vector3(0, 1, 0))
			.multiplyScalar(velocity[2]);

		return right.add(up).add(forward);
	}
}