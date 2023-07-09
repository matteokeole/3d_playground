import {BLOCK_SCALE} from "../constants.js";
import {Vector3} from "../../src/math/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Mesh} from "../../src/Mesh.js";

export default function(textures) {
	const mesh = new Mesh(
		new BoxGeometry(new Vector3(1, 1, 1)),
		new Material({texture: textures["block/crafting_table_top.png"]}),
	);

	mesh.position = new Vector3(0, 1.3, 2).multiplyScalar(.85);
	mesh.scale = new Vector3(1, 1, 1).multiplyScalar(BLOCK_SCALE);

	return [mesh];
}