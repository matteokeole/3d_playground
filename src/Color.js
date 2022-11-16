export function Color(value) {
	this.hex = [
		value >> 16 & 255,
		value >> 8 & 255,
		value & 255,
	];
	this.normalized = [
		(value >> 16 & 255) / 255,
		(value >> 8 & 255) / 255,
		(value & 255) / 255,
		1,
	];
}