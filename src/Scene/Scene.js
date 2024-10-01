import {Clusterizer} from "../Clusterizer.js";
import {Geometry} from "../Geometry/index.js";
import {Mesh} from "../Mesh/index.js";

/**
 * @typedef {Object} AddMeshesDescriptor
 * @property {Mesh[]} meshes
 * @property {Geometry} geometry
 */

export class Scene {
	/**
	 * @type {Geometry[]}
	 */
	#geometries;

	/**
	 * @type {Mesh[]}
	 */
	#meshes;

	/**
	 * @type {Mesh[]}
	 */
	#hullMeshes;

	/**
	 * @type {import("../Clusterizer.js").ClusteredMeshes}
	 */
	#clusteredMeshes;

	/**
	 * @type {Map.<Geometry, Mesh[]>}
	 */
	#instancesByGeometry;

	constructor() {
		this.#geometries = [];
		this.#meshes = [];
		this.#hullMeshes = [];
		this.#clusteredMeshes = null;
		this.#instancesByGeometry = new Map();
	}

	getGeometries() {
		return this.#geometries;
	}

	getMeshes() {
		return this.#meshes;
	}

	getHullMeshes() {
		return this.#hullMeshes;
	}

	getClusteredMeshes() {
		return this.#clusteredMeshes;
	}

	/**
	 * Returns an array of meshes using thez provided geometry.
	 * 
	 * @param {Geometry} geometry
	 */
	getMeshesByGeometry(geometry) {
		if (!this.#instancesByGeometry.has(geometry)) {
			return [];
		}

		return this.#instancesByGeometry.get(geometry);
	}

	/**
	 * Returns the number of meshes using the provided geometry.
	 * 
	 * @param {Geometry} geometry
	 */
	getInstanceCount(geometry) {
		if (!this.#instancesByGeometry.has(geometry)) {
			return 0;
		}

		return this.#instancesByGeometry.get(geometry).length;
	}

	/**
	 * @param {Geometry} geometry
	 * @param {Mesh[]} meshes
	 */
	addMeshes(geometry, meshes) {
		if (!this.#instancesByGeometry.has(geometry)) {
			this.#instancesByGeometry.set(geometry, []);
		}

		const geometryIndex = this.#geometries.length;

		this.#geometries.push(geometry);

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			mesh.setGeometryIndex(geometryIndex);

			this.#instancesByGeometry.get(geometry).push(mesh);
			this.#meshes.push(mesh);

			if (mesh.getHull()) {
				this.#hullMeshes.push(mesh);
			}
		}
	}

	clusterize() {
		this.#clusteredMeshes = Clusterizer.parse(this);
	}
}