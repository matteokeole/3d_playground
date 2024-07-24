import {Vector3} from "../math/index.js";
import {Mesh} from "../Mesh/index.js";
import {GJK} from "./GJK.js";
import {PolygonWinding} from "./PolygonWinding.js";

/**
 * @typedef {Object} ClosestEdge
 * @property {Vector3} normal
 * @property {Number} distance
 * @property {Number} index
 */

/**
 * @typedef {Object} Collision
 * @property {Vector3} normal
 * @property {Number} depth
 */

export class EPA {
	/**
	 * @todo Find balanced number of iterations
	 */
	static #MAX_ITERATIONS = 32;
	/**
	 * @todo Find balanced threshold
	 */
	static #THRESHOLD = 0.001;
	static #BIAS = 0.001;

	/**
	 * @param {import("../math/index.js").Polytope} polytope
	 * @param {PolygonWinding} polygonWinding
	 */
	static #closestEdge(polytope, polygonWinding) {
		/**
		 * @type {ClosestEdge}
		 */
		const closestEdge = {};

		closestEdge.distance = Number.POSITIVE_INFINITY;

		for (let i = 0; i < polytope.length; i++) {
			const j = (i + 1) % polytope.length;
			const a = polytope[i];
			const b = polytope[j];
			const e = new Vector3(b).subtract(a);
			const n = new Vector3();
			const isClockwise = polygonWinding === PolygonWinding.CLOCKWISE ? 1 : -1;

			n[0] = e[1] * isClockwise;
			n[1] = e[0] * -isClockwise;
			n[2] = e[2];
			n.normalize();

			const d = n.dot(a);

			if (d < closestEdge.distance) {
				closestEdge.normal = n;
				closestEdge.distance = d;
				closestEdge.index = j;
			}
		}

		return closestEdge;
	}

	/**
	 * @param {Mesh} mesh1
	 * @param {Mesh} mesh2
	 * @param {import("../math/index.js").Simplex} simplex
	 */
	static test(mesh1, mesh2, simplex) {
		/**
		 * @type {import("../math/index.js").Polytope}
		 */
		const polytope = Array.from(simplex);

		for (let i = 0; i < EPA.#MAX_ITERATIONS; i++) {
			const e = EPA.#closestEdge(polytope, PolygonWinding.COUNTER_CLOCKWISE);
			const s = GJK.support(mesh1, mesh2, e.normal);

			if (s.dot(e.normal) - e.distance < EPA.#THRESHOLD) {
				/**
				 * @type {Collision}
				 */
				const collision = {
					normal: e.normal,
					depth: e.distance + EPA.#BIAS,
				};

				return collision;
			}

			polytope.splice(e.index, 0, s);
		}
		return null;

		// throw new Error("Reached max EPA iterations");
	}
}