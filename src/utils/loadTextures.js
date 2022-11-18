import {TEXTURE_PATH, RESOURCES, TEXTURES} from "../constants.js";

/**
 * Asynchronous texture loader function.
 * 
 * @async
 * @param {WebGL2Renderer} gl
 * @param {array} paths
 */
export async function loadTextures(gl, paths) {
	const {length} = paths;
	let path, image, texture;

	for (let i = 0; i < length; i++) {
		path = paths[i];
		image = new Image();
		image.src = `${TEXTURE_PATH}${path}`;

		try {
			await image.decode();
		} catch (error) {
			continue;
		}

		gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);

		TEXTURES[path] = {image, texture};
	}
}