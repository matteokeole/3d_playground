import {Geometry} from "../../src/geometries/index.js";
import {Mesh as _Mesh} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";
import {SSDPlaneGeometry} from "../hl2/SSDPlaneGeometry.js";

export class Mesh extends _Mesh {
	/**
	 * @param {Object} json
	 */
	static fromJson(json) {
		const anchors = json.anchors;

		if (anchors.length !== 9 && anchors.length !== 12) throw new Error("Invalid mesh geometry");

		const anchor1 = new Vector3(anchors[0], anchors[1], anchors[2]);
		const anchor2 = new Vector3(anchors[3], anchors[4], anchors[5]);
		const anchor3 = new Vector3(anchors[6], anchors[7], anchors[8]);
		const anchor4 = anchors.length === 9 ?
			anchor3.clone().add(anchor1).subtract(anchor2) :
			new Vector3(anchors[9], anchors[10], anchors[11]);

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			null,
		);
	}
}