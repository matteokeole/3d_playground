import {Vector3} from "../math/index.js";
import {Mesh} from "../Mesh/index.js";

export class GJK {
	/**
	 * @todo Find balanced number of iterations
	 */
	static #MAX_ITERATIONS = 32;

	/**
	 * @param {Mesh} mesh1
	 * @param {Mesh} mesh2
	 * @param {Vector3} D Direction
	 */
	static support(mesh1, mesh2, D) {
		const s1 = new Vector3(mesh1.getGeometry().support(D, mesh1.getProjection()));
		const s2 = mesh2.getGeometry().support(new Vector3(D).negate(), mesh2.getProjection());

		return s1.subtract(s2);
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #checkSimplex(simplex, D) {
		if (simplex.length === 2) {
			return GJK.#check1dSimplex(simplex, D);
		}

		if (simplex.length === 3) {
			return GJK.#check2dSimplex(simplex, D);
		}

		if (simplex.length === 4) {
			return GJK.#check3dSimplex(simplex, D);
		}

		return false;
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #check1dSimplex(simplex, D) {
		const [a, b] = simplex;
		const ab = new Vector3(b).subtract(a);
		const ao = new Vector3(a).negate();

		if (ab.dot(ao) > 0) {
			D.set(ab.cross(ao).cross(ab));

			return false;
		}

		simplex.length = 0;
		simplex.push(a);
		D.set(ao);

		return false;
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #check2dSimplex(simplex, D) {
		const [a, b, c] = simplex;
		const ab = new Vector3(b).subtract(a);
		const ac = new Vector3(c).subtract(a);
		const ao = new Vector3(a).negate();
		const abc = ab.cross(ac);

		if (abc.cross(ac).dot(ao) > 0) {
			if (ac.dot(ao) > 0) {
				simplex.length = 0;
				simplex.push(a, c);

				D.set(ac.cross(ao).cross(ac));

				return false;
			}

			simplex.length = 0;
			simplex.push(a, b);

			return GJK.#check1dSimplex(simplex, D);
		}

		if (ab.cross(abc).dot(ao) > 0) {
			simplex.length = 0;
			simplex.push(a, b);

			return GJK.#check1dSimplex(simplex, D);
		}

		if (abc.dot(ao) > 0) {
			simplex.length = 0;
			simplex.push(a, b, c);
			D.set(abc);

			return false;
		}

		simplex.length = 0;
		simplex.push(a, c, b);
		D.set(abc);
		D.negate();

		return false;
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #check3dSimplex(simplex, D) {
		const [a, b, c, d] = simplex;
		const ab = new Vector3(b).subtract(a);
		const ac = new Vector3(c).subtract(a);
		const ad = new Vector3(d).subtract(a);
		const bc = new Vector3(c).subtract(b);
		const cd = new Vector3(d).subtract(c);
		const db = new Vector3(b).subtract(d);
		const ao = new Vector3(a).negate();
		const abc = ab.cross(bc);
		const acd = ac.cross(cd);
		const adb = ad.cross(db);

		if (abc.dot(ao) > 0) {
			simplex.length = 0;
			simplex.push(a, b, c);

			return GJK.#check2dSimplex(simplex, D);
		}

		if (acd.dot(ao) > 0) {
			simplex.length = 0;
			simplex.push(a, c, d);

			return GJK.#check2dSimplex(simplex, D);
		}

		if (adb.dot(ao) > 0) {
			simplex.length = 0;
			simplex.push(a, d, b);

			return GJK.#check2dSimplex(simplex, D);
		}

		return true;
	}

	/**
	 * @param {Mesh} mesh1
	 * @param {Mesh} mesh2
	 */
	static test3d(mesh1, mesh2) {
		const D = new Vector3(1, 0, 0);
		const a = GJK.support(mesh1, mesh2, D);

		if (a.dot(D) < 0) {
			return null;
		}

		/**
	 	 * @type {import("../math/index.js").Simplex}
		 */
		const simplex = [a];

		D.set(a);
		D.negate();

		for (let i = 0; i < GJK.#MAX_ITERATIONS; i++) {
			const a = GJK.support(mesh1, mesh2, D);

			if (a.dot(D) < 0) {
				return null;
			}

			simplex.unshift(a);

			if (GJK.#checkSimplex(simplex, D)) {
				return simplex;
			}
		}

		return null;
	}
}