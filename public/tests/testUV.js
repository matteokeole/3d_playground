import {SCALE, TEXTURES} from "../constants.js";
import {Vector3} from "../../src/math/index.js";
import {BoxGeometry} from "../../src/geometries/index.js";
import {Material} from "../../src/materials/index.js";
import {Mesh} from "../../src/Mesh.js";

export default function() {
	const mesh = new Mesh(
		new BoxGeometry(1, 1, 1),
		new Material({texture: TEXTURES["crafting_table_front.png"]}),
	);

	mesh.position = new Vector3(0, 1.3, 2).multiplyScalar(SCALE);
	mesh.scale = new Vector3(1, 1, 1).multiplyScalar(SCALE);

	return [mesh];
}