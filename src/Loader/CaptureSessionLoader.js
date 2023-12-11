import {Frame, Session} from "../Capture/index.js";
import {Matrix4, PI, Vector3} from "../math/index.js";
import {Loader} from "./Loader.js";

export class CaptureSessionLoader extends Loader {
	/**
	 * Loads and returns a Capture session from a JSON file.
	 * 
	 * @param {String} path JSON file path
	 * @returns {Promise.<Session>}
	 * @throws {Error} if the file request fails
	 */
	async load(path) {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`Could not fetch the file: request failed with status ${response.status}.`);
		}

		const json = await response.json();
		const frames = [];
		const previousPosition = new Vector3();

		const baseOrientation = new Vector3();
		baseOrientation.set(json.baseOrientation ?? []);
		baseOrientation.multiplyScalar(PI);

		for (let i = 0; i < json.frames.length; i++) {
			/* const positionValue = new Vector3();
			console.log(json.frames[i].accelerometer[2]);
			positionValue.set([
				json.frames[i].user_accelerometer[0],
				json.frames[i].user_accelerometer[1],
				json.frames[i].user_accelerometer[2],
			]);

			const position = previousPosition.clone();
			position.add(positionValue);
			position[1] = 64;
			previousPosition.add(positionValue); */
			const position = new Vector3(50, 64, 64);

			const accelerometer = new Vector3();
			accelerometer.set(json.frames[i].accelerometer);

			const magnetometer = new Vector3();
			magnetometer.set(json.frames[i].magnetometer);

			const rotationMatrix = CaptureSessionLoader.#getRotationMatrix(accelerometer, magnetometer);

			// const rotation = new Vector3();
			const rotation = CaptureSessionLoader.#getOrientation(rotationMatrix);
			/* rotation.set([
				0,// json.frames[i].absolute_orientation[1],
				json.frames[i].absolute_orientation_2[0],
				0,// json.frames[i].absolute_orientation[2],
			]); */
			// rotation.add(baseOrientation);

			frames.push(new Frame({position, rotation}));
		}

		return new Session(frames);
	}

	/**
	 * @param {Vector3} gravity
	 * @param {Vector3} geomagnetic
	 */
	static #getRotationMatrix(gravity, geomagnetic) {
		const a = gravity.clone().normalize();
		const e = geomagnetic.clone().normalize();
		const h = e.cross(a).normalize();
		const m = a.cross(h).normalize();

		return new Matrix4(
			h[0], m[0], a[0], 0,
			h[1], m[1], a[1], 0,
			h[2], m[2], a[2], 0,
			0, 0, 0, 1,
		);
	}

	/**
	 * @param {Matrix4} rotationMatrix
	 */
	static #getOrientation(rotationMatrix) {
		return new Vector3(
			Math.atan2(-rotationMatrix[4], rotationMatrix[5]),
			Math.asin(rotationMatrix[6]),
			Math.atan2(-rotationMatrix[2], rotationMatrix[10]),
		);
	}
}