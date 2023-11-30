import {Frame, Session} from "../Capture/index.js";
import {PI, Vector3} from "../math/index.js";
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

			const rotation = new Vector3();
			rotation.set([
				-json.frames[i].orientation[0],
				-json.frames[i].orientation[1],
				json.frames[i].orientation[2],
			]);
			rotation.add(baseOrientation);

			frames.push(new Frame({position, rotation}));
		}

		return new Session(frames);
	}
}