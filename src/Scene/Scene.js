import {GJK} from "../Algorithm/index.js";
import {Clusterizer} from "../Clusterizer.js";
import {Geometry} from "../Geometry/index.js";
import {Material} from "../Material/index.js";
import {Mesh} from "../Mesh/index.js";
import {IntersectionTrigger, Trigger, TriggerState} from "../Trigger/index.js";

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
	 * @type {Material[]}
	 */
	#materials;

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

	/**
	 * @type {Trigger[]}
	 */
	#triggers;

	/**
	 * @type {Number[]}
	 */
	#intersectionTriggerIndices;

	constructor() {
		this.#geometries = [];
		this.#meshes = [];
		this.#materials = [];
		this.#hullMeshes = [];
		this.#triggers = [];
		this.#intersectionTriggerIndices = [];
		this.#clusteredMeshes = null;
		this.#instancesByGeometry = new Map();
	}

	getGeometries() {
		return this.#geometries;
	}

	getMeshes() {
		return this.#meshes;
	}

	getMaterials() {
		return this.#materials;
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

	getTriggers() {
		return this.#triggers;
	}

	getIntersectionTriggerIndices() {
		return this.#intersectionTriggerIndices;
	}

	/**
	 * @param {Material} material
	 */
	addMaterial(material) {
		this.#materials.push(material);
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

	/**
	 * @param {Trigger} trigger
	 */
	addTrigger(trigger) {
		this.#triggers.push(trigger);

		if (trigger instanceof IntersectionTrigger) {
			this.#intersectionTriggerIndices.push(this.#triggers.length - 1);
		}
	}

	clusterize() {
		this.#clusteredMeshes = Clusterizer.parse(this);
	}

	updateTriggers() {
		this.#updateIntersectionTriggers();
	}

	/**
	 * Generates console warnings if scene data is invalid.
	 */
	validate() {
		if (this.#clusteredMeshes === null) {
			console.warn("Scene validation: Scene is not clustered.");
		}

		if (this.#meshes.length === 0) {
			console.warn("Scene validation: Mesh count is 0.");
		}

		if (this.#materials.length === 0) {
			console.warn("Scene validation: Material count is 0.");
		}
	}

	#updateIntersectionTriggers() {
		for (let index = 0; index < this.#intersectionTriggerIndices.length; index++) {
			const intersectionTriggerIndex = this.#intersectionTriggerIndices[index];

			/**
			 * @type {IntersectionTrigger}
			 */
			const intersectionTrigger = this.#triggers[intersectionTriggerIndex];

			if (intersectionTrigger.getState() === TriggerState.OFF) {
				continue;
			}

			/**
			 * @todo Test intersection between trigger and object
			 */
			for (let physicalObjectIndex = 0; physicalObjectIndex < this.#hullMeshes.length; physicalObjectIndex++) {
				const physicalObject = this.#meshes[physicalObjectIndex];

				if (!(physicalObject instanceof intersectionTrigger.getObjectType())) {
					continue;
				}

				const simplex = GJK.test3d(intersectionTrigger, physicalObject.getHull());

				if (simplex === null) {
					continue;
				}

				intersectionTrigger.onIntersect(physicalObject);

				if (intersectionTrigger.getState() === TriggerState.OFF) {
					break;
				}
			}
		}
	}
}