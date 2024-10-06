import {DynamicMesh} from "../../../../../src/Mesh/index.js";

export class Player extends DynamicMesh {
	#health;

	/**
	 * @param {import("../../../../../src/Mesh/Mesh.js").MeshDescriptor & import("../../../../../src/Mesh/DynamicMesh.js").DynamicMeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#health = 100;
	}

	getHealth() {
		return this.#health;
	}

	/**
	 * @param {Number} damageAmount
	 */
	damage(damageAmount) {
		this.#health -= damageAmount;
	}
}