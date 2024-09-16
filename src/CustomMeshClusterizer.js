import {Mesh} from "./Mesh/index.js";

/**
 * @typedef {Object} Cluster
 * @property {Number} meshIndex
 */

export class CustomMeshClusterizer {
	/**
	 * @param {Mesh} mesh
	 * @param {Number} meshIndex
	 */
	static clusterize(mesh, meshIndex) {
		const geometry = mesh.getGeometry();
		const indices = geometry.getIndices();
		const triangleCount = indices.length / 3;

		if (!Number.isInteger(triangleCount)) {
			throw new Error("Clusterize failed: triangle count is not a multiple of 3");
		}

		const clusters = [];

		/**
		 * @type {Cluster}
		 */
		let cluster = {};

		for (let i = 0; i < indices.length; i += 128 * 3) {
			cluster.meshIndex = meshIndex;

			clusters.push(cluster);
		}

		/**
		 * @todo Insert degenerate triangles
		 */

		return clusters;
	}
}