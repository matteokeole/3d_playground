import {AbstractMesh} from "src";
import {BoxGeometry} from "src/geometries";
import {TextureMaterial} from "src/materials";
import {Matrix3, PI, Vector2, Vector3} from "src/math";
import {HitBox} from "./HitBox.js";
import {SSDPlaneGeometry} from "./SSDPlaneGeometry.js";

export class Mesh extends AbstractMesh {
	/**
	 * @private
	 * @type {?HitBox}
	 */
	#hitbox;

	static fromJSON(json, textures) {
		const {anchors} = json;

		if (anchors.length !== 9 && anchors.length !== 12) throw new Error("Invalid mesh geometry");

		const anchor1 = new Vector3(anchors[0], anchors[1], anchors[2]);
		const anchor2 = new Vector3(anchors[3], anchors[4], anchors[5]);
		const anchor3 = new Vector3(anchors[6], anchors[7], anchors[8]);
		const anchor4 = anchors.length === 9 ?
			anchor3.clone().add(anchor1).subtract(anchor2) :
			new Vector3(anchors[9], anchors[10], anchors[11]);

		const image = textures[json.texture].image;

		const w = anchor1.to(anchor2);
		const h = anchor2.to(anchor3);

		const translation = new Vector2(json.uv[0], json.uv[1]);
		const rotation = json.uv_rotation * PI;
		const scale = new Vector2(h, w)
			.divide(new Vector2(image.width, image.height))
			.divide(new Vector2(json.uv_scale[0], json.uv_scale[1]));

		return new Mesh(
			SSDPlaneGeometry.fromAnchors([anchor1, anchor2, anchor3, anchor4]),
			new TextureMaterial({
				textureMatrix: Matrix3
					.translation(translation)
					.multiply(Matrix3.rotation(rotation))
					.multiply(Matrix3.scale(scale)),
				texture: textures[json.texture],
				normalMap: textures[json.normal_map],
			}),
		);
	}

	/** @returns {?HitBox} */
	get hitbox() {
		return this.#hitbox;
	}

	buildHitBox() {
		if (!(this.geometry instanceof BoxGeometry)) {
			throw Error("Can't initialize the hitbox of a non-3D mesh.");
		}

		this.#hitbox = new HitBox({
			position: this.position,
			size: this.geometry.size,
		});
	}
}