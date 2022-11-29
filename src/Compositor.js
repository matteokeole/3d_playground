import {GUI} from "../public/constants.js";

const layers = new Set();
const texture = new OffscreenCanvas(GUI.screenWidth, GUI.screenHeight);

const addLayer = layer => layers.add(layer);
const removeLayer = layer => layers.delete(layer);

/**
 * @todo Implement
 */
function compose() {}

export const Compositor = {addLayer, removeLayer, compose, texture};