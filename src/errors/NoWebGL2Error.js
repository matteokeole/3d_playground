export function NoWebGL2Error() {
	this.message = "It seems that your browser doesn't support WebGL2.";
	this.getTemplate = function() {
		const
			div = document.createElement("div"),
			img = document.createElement("img");

		div.className = "error";
		img.src = "assets/images/webgl.png";

		div.append(img, this.message);

		return div;
	};
}

NoWebGL2Error.prototype = Error.prototype;