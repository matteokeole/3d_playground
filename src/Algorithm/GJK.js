import {Vector3} from "../math/index.js";
import {Mesh} from "../Mesh/index.js";

export class GJK {
	static #MAX_ITERATIONS = 8;

	/**
	 * @param {Mesh} mesh1
	 * @param {Mesh} mesh2
	 * @param {Vector3} D Direction
	 */
	static #support(mesh1, mesh2, D) {
		const s0 = new Vector3(mesh1.getGeometry().support(D));
		s0.add(mesh1.getPosition());

		const s1 = new Vector3(mesh2.getGeometry().support(new Vector3(D).negate()));
		s1.add(mesh2.getPosition());

		return s0.subtract(s1);
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #check1dSimplex(simplex, D) {
		const [b, a] = simplex;
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
		const [c, b, a] = simplex;
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
		D.set(abc.negate());

		return false;
	}

	/**
	 * @param {import("../math/index.js").Simplex} simplex
	 * @param {Vector3} D Direction
	 */
	static #check3dSimplex(simplex, D) {
		const [d, c, b, a] = simplex;
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
		const D = new Vector3(0, 1, 0);
		const a = GJK.#support(mesh1, mesh2, D);

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
			const a = GJK.#support(mesh1, mesh2, D);

			if (a.dot(D) < 0) {
				return null;
			}

			simplex.push(a);

			if (simplex.length === 2) {
				GJK.#check1dSimplex(simplex, D);

				continue;
			}

			if (simplex.length === 3) {
				GJK.#check2dSimplex(simplex, D);

				continue;
			}

			if (simplex.length === 4) {
				if (GJK.#check3dSimplex(simplex, D)) {
					return simplex;
				}
			}
		}

		return null;
	}
}