import {Vector3} from "../../../../../src/math/index.js";
import {DynamicMesh} from "../../../../../src/Mesh/index.js";

export class Door extends DynamicMesh {
	#inUse;
	#usePosition;

	/**
	 * @param {import("../../../../../src/Mesh/Mesh.js").MeshDescriptor & import("../../../../../src/Mesh/DynamicMesh.js").DynamicMeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#inUse = false;
		this.#usePosition = new Vector3(0, 0, 0);
	}

	isInUse() {
		return this.#inUse;
	}

	getUsePosition() {
		return this.#usePosition;
	}

	/**
	 * @param {Vector3} position
	 */
	use(position) {
		this.#inUse = true;
		this.#usePosition = position;
	}

	quitUse() {
		this.#inUse = false;
	}
}