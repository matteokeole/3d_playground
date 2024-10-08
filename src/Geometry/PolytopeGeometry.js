import {Vector3} from "../math/index.js";
import {Geometry} from "./Geometry.js";

export class PolytopeGeometry extends Geometry {
	/**
	 * @type {Geometry["support"]}
	 */
	support(D, p) {
		const positions = this.getPositions();
		const support = new Vector3(0, 0, 0);
		let maxDot = Number.NEGATIVE_INFINITY;

		for (let i = 0; i < positions.length; i += 3) {
			const vertex = new Vector3(...positions.subarray(i, i + 3)).multiplyMatrix(p);
			const dot = vertex.dot(D);

			if (dot > maxDot) {
				maxDot = dot;
				support.set(vertex);
			}
		}

		return support;
	}
}