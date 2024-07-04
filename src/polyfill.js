import {Vector2, Vector3, Vector4} from "./math/index.js";

export function setPolyfills() {
	/**
	 * Vector2.to polyfill
	 * 
	 * @param {Vector2} v
	 */
	// @ts-ignore
	Vector2.prototype.to = function(v) {
		return new Vector2(v).subtract(this).magnitude();
	};

	/**
	 * Vector3.to polyfill
	 * 
	 * @param {Vector3} v
	 */
	// @ts-ignore
	Vector3.prototype.to = function(v) {
		return new Vector3(v).subtract(this).magnitude();
	};

	/**
	 * Vector4.to polyfill
	 * 
	 * @param {Vector4} v
	 */
	// @ts-ignore
	Vector4.prototype.to = function(v) {
		return new Vector4(v).subtract(this).magnitude();
	};
}