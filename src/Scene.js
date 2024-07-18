import {Geometry} from "./Geometry/index.js";
import {Mesh} from "./Mesh/index.js";

export class Scene {
	#geometries;
	#meshes;

	/**
	 * @param {Mesh[]} meshes
	 */
	constructor(meshes) {
		/**
		 * @type {Geometry[]}
		 */
		this.#geometries = [];
		this.#meshes = meshes;

		for (let i = 0; i < this.#meshes.length; i++) {
			const mesh = this.#meshes[i];
			const geometry = mesh.getGeometry();

			this.#geometries.push(geometry);
		}
	}

	getGeometries() {
		return this.#geometries;
	}

	getMeshes() {
		return this.#meshes;
	}

	/**
	 * Returns an array of meshes using thez provided geometry.
	 * 
	 * @param {Geometry} geometry
	 */
	getMeshesByGeometry(geometry) {
		const meshes = [];

		for (let i = 0; i < this.#meshes.length; i++) {
			const mesh = this.#meshes[i];

			if (mesh.getGeometry() instanceof geometry.constructor) {
				meshes.push(mesh);
			}
		}

		return meshes;
	}

	/**
	 * Returns the number of meshes using the provided geometry.
	 * 
	 * @param {Geometry} geometry
	 */
	getInstanceCount(geometry) {
		let instanceCount = 0;

		for (let i = 0; i < this.#meshes.length; i++) {
			const mesh = this.#meshes[i];

			if (mesh.getGeometry() instanceof geometry.constructor) {
				instanceCount++;
			}
		}

		return instanceCount;
	}
}