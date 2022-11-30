import {GUI} from "../../public/constants.js";

/**
 * @param {number} ex
 * @param {number} ey
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {boolean}
 */
export function intersect([ex, ey], [x, y, w, h]) {
	const scale = GUI.scale.current;

	ex /= scale;
	ey /= scale;

	return (
		ex >= x &&
		ex < x + w &&
		ey >= y &&
		ey < y + h
	);
};