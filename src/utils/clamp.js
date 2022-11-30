export const
	/**
	 * @param {number} n
	 * @param {number} min
	 * @param {number} max
	 */
	clamp = function(n, min, max) {
		n < min && (n = min);
		n > max && (n = max);

		return n;
	},
	/**
	 * @param {number} n
	 * @param {number} min
	 */
	clampDown = (n, min) => n < min ? min : n,
	/**
	 * @param {number} n
	 * @param {number} max
	 */
	clampUp = (n, max) => n > max ? max : n;