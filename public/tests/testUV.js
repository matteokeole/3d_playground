import {Mesh} from "src";
import {BoxGeometry} from "src/geometries";
import {TextureMaterial} from "src/materials";
import {Vector3} from "src/math";
import {BLOCK_SCALE} from "../main.js";

export default function(textures) {
	const mesh = new Mesh(
		new BoxGeometry(new Vector3(1, 1, 1)),
		new TextureMaterial({texture: textures["block/crafting_table_top.png"]}),
	);

	mesh.position = new Vector3(0, 1.3, 2).multiplyScalar(.85);
	mesh.scale = new Vector3(1, 1, 1).multiplyScalar(BLOCK_SCALE);

	return [mesh];
}