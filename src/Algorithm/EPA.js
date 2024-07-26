import {Vector3, Vector4} from "../math/index.js";
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
 * @property {Number} depth Contains depth bias
 */

/**
 * @typedef {Object} FaceNormals
 * @property {Vector4[]} normals
 * @property {Number} minTriangleIndex
 */

export class EPA {
	/**
	 * @todo Find balanced threshold
	 */
	static #THRESHOLD = 0.001;
	static #DEPTH_BIAS = 0.001;

	/**
	 * @param {import("../math/index.js").Polytope} polytope
	 * @param {Number[]} faces
	 */
	static #getFaceNormals(polytope, faces) {
		/**
		 * @type {FaceNormals}
		 */
		const faceNormals = {
			normals: [],
			minTriangleIndex: 0,
		};
		let minDistance = Number.POSITIVE_INFINITY;

		for (let i = 0; i < faces.length; i += 3) {
			const a = polytope[faces[i + 0]];
			const b = polytope[faces[i + 1]];
			const c = polytope[faces[i + 2]];
			const ab = new Vector3(b).subtract(a);
			const ac = new Vector3(c).subtract(a);
			const normal = ab.cross(ac).normalize();
			let distance = normal.dot(a);

			if (distance < 0) {
				normal.multiplyScalar(-1);
				distance *= -1;
			}

			const normalAndDistance = new Vector4(...normal, distance);

			faceNormals.normals.push(normalAndDistance);

			if (distance < minDistance) {
				faceNormals.minTriangleIndex = i / 3;
				minDistance = distance;
			}
		}

		return faceNormals;
	}

	/**
	 * @param {[Number, Number][]} edges
	 * @param {Number[]} faces
	 * @param {Number} b
	 * @param {Number} a
	 */
	static #addIfUniqueEdge(edges, faces, a, b) {
		const reverseIndex = edges.findIndex(edge => edge[0] === faces[b] && edge[1] === faces[a]);

		if (reverseIndex === -1) {
			edges.push([faces[a], faces[b]]);

			return;
		}

		edges.splice(reverseIndex, 1);
	}

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
	static test3d(mesh1, mesh2, simplex) {
		/**
		 * @type {import("../math/index.js").Polytope}
		 */
		const polytope = Array.from(simplex);
		const faces = [
			0, 1, 2,
			0, 3, 1,
			0, 2, 3,
			1, 3, 2,
		];
		let {minTriangleIndex, normals} = EPA.#getFaceNormals(polytope, faces);
		const minNormal = new Vector3(0, 0, 0);
		let minDistance = Number.POSITIVE_INFINITY;

		while (minDistance === Number.POSITIVE_INFINITY) {
			const normalAndDistance = new Float32Array(normals[minTriangleIndex]);

			minNormal.set(normalAndDistance.subarray(0, 3));
			minDistance = normalAndDistance[3];

			const s = GJK.support(mesh1, mesh2, minNormal);
			const sDistance = minNormal.dot(s);

			if (Math.abs(sDistance - minDistance) > EPA.#THRESHOLD) {
				minDistance = Number.POSITIVE_INFINITY;

				/**
				 * @type {[Number, Number][]}
				 */
				const uniqueEdges = [];

				for (let i = 0; i < normals.length; i++) {
					const normal = new Vector3(...new Float32Array(normals[i]).subarray(0, 3));

					if (normal.dot(s) > 0) {
						const f = i * 3;

						EPA.#addIfUniqueEdge(uniqueEdges, faces, f + 0, f + 1);
						EPA.#addIfUniqueEdge(uniqueEdges, faces, f + 1, f + 2);
						EPA.#addIfUniqueEdge(uniqueEdges, faces, f + 2, f + 0);

						faces[f + 2] = faces[faces.length - 1]; faces.pop();
						faces[f + 1] = faces[faces.length - 1]; faces.pop();
						faces[f + 0] = faces[faces.length - 1]; faces.pop();

						normals[i] = normals[normals.length - 1]; normals.pop();

						i--;
					}
				}

				const newFaces = [];

				for (let i = 0; i < uniqueEdges.length; i++) {
					const [edgeIndex1, edgeIndex2] = uniqueEdges[i];

					newFaces.push(edgeIndex1);
					newFaces.push(edgeIndex2);
					newFaces.push(polytope.length);
				}

				polytope.push(s);

				const {normals: newNormals, minTriangleIndex: newMinTriangleIndex} = EPA.#getFaceNormals(polytope, newFaces);

				let oldMinDistance = Number.POSITIVE_INFINITY;

				for (let i = 0; i < normals.length; i++) {
					if (normals[i][3] >= oldMinDistance) {
						continue;
					}

					oldMinDistance = normals[i][3];
					minTriangleIndex = i;
				}

				if (newNormals[newMinTriangleIndex][3] < oldMinDistance) {
					minTriangleIndex = newMinTriangleIndex + normals.length;
				}

				faces.push(...newFaces);
				normals.push(...newNormals);
			}
		}

		/**
		 * @type {Collision}
		 */
		const collision = {
			normal: minNormal,
			depth: minDistance + EPA.#DEPTH_BIAS,
		};

		return collision;
	}
}