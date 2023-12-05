import {PI, Vector3} from "../../src/math/index.js";

export default async function initCaptureSession(camera) {
	const session = await (await fetch("assets/capture.json")).json();

	// Get JSON frames
	let frames = session.frames.map(frame => {
		frame.position = new Vector3(
			frame["position"][0],
			0, // frame["position"][1],
			0, // -frame["position"][2],
		);
		frame.setRotation(new Vector3(
			frame["rotation"][2],
			frame["rotation"][0],
			frame["rotation"][1],
		));

		return frame;
	});

	// Get raw frames
	for (let i = frames.length - 1; i >= 0; i--) {
		// Position
		{
			const prevPosition = frames[i - 1]?.position ?? new Vector3(0, 0, 0);
			const frame = frames[i];

			// frame.position = frame.position.substract(prevPosition);
			// frame.position = frame.position.multiplyScalar(.04)
		}

		// Rotation
		{
			const prevRotation = frames[i - 1]?.getRotation() ?? new Vector3(0, 0, 0);
			const frame = frames[i];

			frame.getRotation().substract(prevRotation).multiplyScalar(PI / 180);
		}
	}

	camera.setCaptureSession(frames);
}