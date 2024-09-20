import {Geometry} from "./Geometry/index.js";

/**
 * @typedef {Object} ClusteredGeometry
 * @property {Cluster[]} clusters
 */

/**
 * @typedef {Object} Cluster
 * @property {Uint32Array} vertices Fixed size of 64
 * @property {Uint32Array} indices Fixed size of 126
 * @property {Number} vertexCount
 * @property {Number} indexCount
 */

/**
 * @deprecated
 */
export class Clusterizer {
	/**
	 * @param {Geometry} geometry
	 */
	static clusterize(geometry) {
		const indices = geometry.getIndices();
		const triangleCount = indices.length / 3;

		if (!Number.isInteger(triangleCount)) {
			throw new Error("Clusterize failed: index count is not a multiple of 3");
		}

		const clusterVertices = new Uint8Array(geometry.getVertices().length).fill(0xff);

		/**
		 * @type {Cluster}
		 */
		let cluster = {};

		cluster.vertices = new Uint32Array(64);
		cluster.indices = new Uint32Array(126);
		cluster.vertexCount = 0;
		cluster.indexCount = 0;

		/**
		 * @type {ClusteredGeometry}
		 */
		const clusteredGeometry = {};

		clusteredGeometry.clusters = [];

		for (let triangleIndex = 0; triangleIndex < indices.length; triangleIndex += 3) {
			const i0 = indices[triangleIndex + 0];
			const i1 = indices[triangleIndex + 1];
			const i2 = indices[triangleIndex + 2];

			let v0 = clusterVertices[i0];
			let v1 = clusterVertices[i1];
			let v2 = clusterVertices[i2];

			const trueTriangleVertexCount = Number(v0 !== 0xff) + Number(v1 !== 0xff) + Number(v2 !== 0xff);

			if (cluster.vertexCount + trueTriangleVertexCount > 64) {
				clusteredGeometry.clusters.push(cluster);

				// Reset current cluster
				cluster.vertices = new Uint32Array(64);
				cluster.indices = new Uint32Array(126);
				cluster.vertexCount = 0;
				cluster.indexCount = 0;
			}

			if (cluster.indexCount + 3 > 126) {
				clusteredGeometry.clusters.push(cluster);

				// Reset current cluster
				cluster.vertices = new Uint32Array(64);
				cluster.indices = new Uint32Array(126);
				cluster.vertexCount = 0;
				cluster.indexCount = 0;
			}

			// If the vertex is not in the meshlet we need to add it
			if (v0 === 0xff) {
				v0 = cluster.vertexCount;

				cluster.vertices[cluster.vertexCount] = i0;

				cluster.vertexCount++;
			}

			// If the vertex is not in the meshlet we need to add it
			if (v1 === 0xff) {
				v1 = cluster.vertexCount;

				cluster.vertices[cluster.vertexCount] = i1;

				cluster.vertexCount++;
			}

			// If the vertex is not in the meshlet we need to add it
			if (v2 === 0xff) {
				v2 = cluster.vertexCount;

				cluster.vertices[cluster.vertexCount] = i2;

				cluster.vertexCount++;
			}

			cluster.indices[cluster.indexCount++] = v0;
			cluster.indices[cluster.indexCount++] = v1;
			cluster.indices[cluster.indexCount++] = v2;
		}

		if (cluster.indexCount !== 0) {
			clusteredGeometry.clusters.push(cluster);
		}

		return clusteredGeometry;
	}
}