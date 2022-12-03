import {GUI} from "../public/constants.js";
import {Renderer} from "../src/Renderer.js";

const layerSet = new Set();
const canvas = new OffscreenCanvas(GUI.screenWidth, GUI.screenHeight);
const ctx = canvas.getContext("2d");

const addLayer = layer => layerSet.add(layer);
const removeLayer = layer => layerSet.delete(layer);

function compose() {
	const
		layers = [...layerSet],
		{length} = layers;

	for (let i = 0; i < length; i++) {
		ctx.drawImage(layers[i].canvas, 0, 0, GUI.screenWidth, GUI.screenHeight);
	}

	const gl = Renderer.getContext();

	gl.bindTexture(gl.TEXTURE_2D, gl.guiTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
}

export const Compositor = {addLayer, removeLayer, compose};