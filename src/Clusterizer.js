import {Scene} from "./Scene/index.js";

/**
 * @typedef {Object} ClusteredMeshes
 * @property {Float32Array} vertexPositionBuffer
 * @property {Float32Array} vertexNormalBuffer
 * @property {Uint32Array} vertexPositionIndexBuffer
 * @property {Uint32Array} vertexNormalIndexBuffer
 * @property {ClusteredMesh[]} meshes
 * @property {Cluster[]} clusters
 */

/**
 * @typedef {Object} ClusteredMesh
 * @property {Number} clusterCount
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

export class Clusterizer {
	static #TRIANGLES_PER_CLUSTER = 128;
	static #INDICES_PER_CLUSTER = Clusterizer.#TRIANGLES_PER_CLUSTER * 3;

	/**
	 * @todo Insert degenerate triangles?
	 * 
	 * Creates clustered geometry out of a mesh array.
	 * Clusters are extracted naively using index buffer blocks.
	 * The drawback of this method is that the last cluster usually doesn't reference as much triangles as it can.
	 * 
	 * The vertices of a geometry are shared by all the meshes using this geometry,
	 * but the indices are duplicated per mesh.
	 * 
	 * @param {Scene} scene
	 */
	static parse(scene) {
		const geometries = scene.getGeometries();

		/**
		 * @type {ClusteredMeshes}
		 */
		const clusteredMeshes = {};

		clusteredMeshes.meshes = [];
		clusteredMeshes.clusters = [];

		const clusteredGeometries = [];
		let totalVertexPositionCount = 0;
		let totalVertexNormalCount = 0;
		let totalIndexCount = 0;

		// Determine index count per unique geometry
		for (let geometryIndex = 0; geometryIndex < geometries.length; geometryIndex++) {
			const geometry = geometries[geometryIndex];
			const positions = geometry.getPositions();
			const normals = geometry.getNormals();
			const indices = geometry.getPositionIndices(); // Position indices SHOULD BE AS MANY as normal indices
			const indexCount = indices.length;
			const standaloneIndexCount = indexCount % Clusterizer.#INDICES_PER_CLUSTER;
			const clusterCount = Math.floor(indexCount / Clusterizer.#INDICES_PER_CLUSTER) + Number(standaloneIndexCount > 0);

			/**
			 * @type {ClusteredGeometry}
			 */
			const clusteredGeometry = {};

			clusteredGeometry.geometryIndex = geometryIndex;
			clusteredGeometry.indexCount = clusterCount * Clusterizer.#INDICES_PER_CLUSTER;
			clusteredGeometry.degenerateIndexCount = 0;

			if (standaloneIndexCount !== 0) {
				// Indices will remain after the clusterization of this geometry
				// To prevent this, add a final cluster for degenerate triangles
				clusteredGeometry.degenerateIndexCount = Clusterizer.#INDICES_PER_CLUSTER - standaloneIndexCount;
			}

			clusteredGeometry.totalIndexCount = clusterCount * Clusterizer.#INDICES_PER_CLUSTER;

			const meshCount = scene.getInstanceCount(geometry);

			clusteredGeometry.clusterCount = clusterCount;
			clusteredGeometry.meshCount = meshCount;

			clusteredGeometries.push(clusteredGeometry);

			totalVertexPositionCount += positions.length / 3;
			totalVertexNormalCount += normals.length / 3;
			totalIndexCount += clusteredGeometry.indexCount * meshCount;
		}

		// Write vertex position buffer
		clusteredMeshes.vertexPositionBuffer = new Float32Array(3 * totalVertexPositionCount);

		// Write vertex normal buffer
		clusteredMeshes.vertexNormalBuffer = new Float32Array(3 * totalVertexNormalCount);

		// Write vertex position index buffer
		clusteredMeshes.vertexPositionIndexBuffer = new Uint32Array(totalIndexCount);

		// Write vertex normal index buffer
		clusteredMeshes.vertexNormalIndexBuffer = new Uint32Array(totalIndexCount);

		let vertexPositionOffset = 0;
		let vertexNormalOffset = 0;
		let indexOffset = 0; // Cluster-wise index offset
		let meshIndexOffset = 0;

		for (let clusteredGeometryIndex = 0; clusteredGeometryIndex < clusteredGeometries.length; clusteredGeometryIndex++) {
			const clusteredGeometry = clusteredGeometries[clusteredGeometryIndex];
			const geometry = scene.getGeometries()[clusteredGeometry.geometryIndex];

			// Write vertex positions
			clusteredMeshes.vertexPositionBuffer.set(geometry.getPositions(), vertexPositionOffset);

			// Write vertex normals
			clusteredMeshes.vertexNormalBuffer.set(geometry.getNormals(), vertexNormalOffset);

			for (let meshIndex = 0; meshIndex < clusteredGeometry.meshCount; meshIndex++, meshIndexOffset++) {
				// Write vertex position indices
				clusteredMeshes.vertexPositionIndexBuffer.set(geometry.getPositionIndices(), indexOffset);

				// Write vertex normal indices
				clusteredMeshes.vertexNormalIndexBuffer.set(geometry.getNormalIndices(), indexOffset);

				indexOffset += clusteredGeometry.totalIndexCount;

				for (let clusterIndex = 0; clusterIndex < clusteredGeometry.clusterCount; clusterIndex++) {
					/**
					 * @type {Cluster}
					 */
					const cluster = {};

					cluster.meshIndex = meshIndexOffset;

					clusteredMeshes.clusters.push(cluster);
				}

				/**
				 * @type {ClusteredMesh}
				 */
				const clusteredMesh = {};

				clusteredMesh.clusterCount = clusteredGeometry.clusterCount;

				clusteredMeshes.meshes.push(clusteredMesh);
			}

			vertexPositionOffset += geometry.getPositions().length;
			vertexNormalOffset += geometry.getNormals().length;
		}

		return clusteredMeshes;
	}
}