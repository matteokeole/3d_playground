export class OBJUnhandledFaceError extends Error {
	/**
	 * @param {Number} faceVertexCount
	 */
	constructor(faceVertexCount) {
		super(`Encountered a face having an unexpected vertex count (${faceVertexCount}).`);
	}
}