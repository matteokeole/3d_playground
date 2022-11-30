export const TextBuffer = typeof OffscreenCanvas !== "undefined" ?
	new OffscreenCanvas(0, 0) :
	document.createElement("canvas");

TextBuffer.bctx = TextBuffer.getContext("2d");

TextBuffer.resize = (w, h) => {
	TextBuffer.width = w;
	TextBuffer.height = h;
	TextBuffer.bctx.imageSmoothingEnabled = false;
};