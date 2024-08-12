import {Loader} from "./Loader.js";

export class FBXLoader extends Loader {
	static #HEADER_TOP = "Kaydara FBX Binary  \x00";
	static #COMMENT_CHARACTER = ";";

	/**
	 * @param {Uint8Array} bytes
	 */
	static #bytesToInt(bytes) {
		let int = 0;

		for (var i = bytes.length - 1; i >= 0; i--) {
			int = (int * 256) + bytes[i];
		}

		return int;
	}

	/**
	 * @param {String} header
	 */
	static #parseHeader(header) {
		// const textEncoder = new TextEncoder();
		// const encoded = textEncoder.encode(header);
		// const version = FBXLoader.#bytesToInt(encoded.subarray(23, 26));
		// const version = new Uint32Array(encoded.buffer.slice(23, 26));
		// console.log(header, version, String.fromCharCode(...encoded.subarray(0, 20)));
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const text = await response.text();
		const textLines = text.split("\n");

		for (let i = 0; i < textLines.length; i++) {
			const textLine = textLines[i].trim();

			if (textLine.length === 0) {
				continue;
			}

			if (textLine.startsWith(FBXLoader.#COMMENT_CHARACTER)) {
				continue;
			}

			/**
			 * @todo
			 */
			if (i === 0) {
				FBXLoader.#parseHeader(textLine);
			}
		}

		return text;
	}
}