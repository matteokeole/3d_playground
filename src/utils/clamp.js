export const
	clamp = function(n, min, max) {
		n < min && (n = min);
		n > max && (n = max);

		return n;
	},
	clampDown = (n, min) => n < min ? min : n,
	clampUp = (n, max) => n > max ? max : n;