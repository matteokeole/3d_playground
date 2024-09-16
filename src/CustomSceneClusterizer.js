import {Scene} from "./Scene/index.js";

/**
 * @typedef {Object} ClusteredMeshes
 * @property {Uint32Array} indexBuffer
 * @property {Cluster[]} clusters
 */

/**
 * @typedef {Object} ClusteredGeometry
 * @property {Number} geometryIndex
 * @property {Number} indexCount
 * @property {Number} degenerateIndexCount
 * @property {Number} totalIndexCount Total index count for one mesh
 * @property {Number} clusterCount
 * @property {Number} meshCount
 */

/**
 * @typedef {Object} Cluster
 * @property {Number} meshIndex
 */

export class CustomSceneClusterizer {
	static #TRIANGLES_PER_CLUSTER = 128;
	static #INDICES_PER_CLUSTER = CustomSceneClusterizer.#TRIANGLES_PER_CLUSTER * 3;

	/**
	 * @todo Insert degenerate triangles?
	 * 
	 * Creates clustered geometry out of a mesh array.
	 * The drawback of this method is that the last cluster usually doesn't reference as much triangles as it can.
	 * 
	 * @param {Scene} scene
	 */
	static clusterize(scene) {
		const geometries = scene.getGeometries();
		const meshes = scene.getMeshes();

		/**
		 * @type {ClusteredMeshes}
		 */
		const clusteredMeshes = {};

		clusteredMeshes.clusters = [];

		const clusteredGeometries = [];
		let totalIndexCount = 0;

		// Determine index count per unique geometry
		for (let geometryIndex = 0; geometryIndex < geometries.length; geometryIndex++) {
			const geometry = geometries[geometryIndex];
			const indices = geometry.getIndices();
			const indexCount = indices.length;
			const standaloneIndexCount = indexCount % CustomSceneClusterizer.#INDICES_PER_CLUSTER;
			const clusterCount = Math.floor(indexCount / CustomSceneClusterizer.#INDICES_PER_CLUSTER) + Number(standaloneIndexCount > 0);

			/**
			 * @type {ClusteredGeometry}
			 */
			const clusteredGeometry = {};

			clusteredGeometry.geometryIndex = geometryIndex;
			clusteredGeometry.indexCount = clusterCount * CustomSceneClusterizer.#INDICES_PER_CLUSTER;
			clusteredGeometry.degenerateIndexCount = 0;

			if (standaloneIndexCount !== 0) {
				// Indices will remain after the clusterization of this geometry
				// To prevent this, add a final cluster for degenerate triangles
				clusteredGeometry.degenerateIndexCount = CustomSceneClusterizer.#INDICES_PER_CLUSTER - standaloneIndexCount;
			}

			clusteredGeometry.totalIndexCount = clusterCount * CustomSceneClusterizer.#INDICES_PER_CLUSTER;

			const meshCount = scene.getInstanceCount(geometry);

			clusteredGeometry.clusterCount = clusterCount;
			clusteredGeometry.meshCount = meshCount;

			clusteredGeometries.push(clusteredGeometry);

			totalIndexCount += clusteredGeometry.indexCount * meshCount;
		}

		clusteredMeshes.indexBuffer = new Uint32Array(totalIndexCount);
		let indexOffset = 0;

		for (let clusteredGeometryIndex = 0; clusteredGeometryIndex < clusteredGeometries.length; clusteredGeometryIndex++) {
			const clusteredGeometry = clusteredGeometries[clusteredGeometryIndex];
			const geometry = scene.getGeometries()[clusteredGeometry.geometryIndex];

			for (let meshIndex = 0; meshIndex < clusteredGeometry.meshCount; meshIndex++) {
				// Set geometry indices
				clusteredMeshes.indexBuffer.set(geometry.getIndices(), indexOffset);

				indexOffset += clusteredGeometry.totalIndexCount;

				for (let clusterIndex = 0; clusterIndex < clusteredGeometry.clusterCount; clusterIndex++) {
					/**
					 * @type {Cluster}
					 */
					const cluster = {};

					cluster.meshIndex = meshIndex;

					clusteredMeshes.clusters.push(cluster);
				}
			}
		}

		return clusteredMeshes;
	}
}