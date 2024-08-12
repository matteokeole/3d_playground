import {Loader} from "./Loader.js";

export class FBXLoader extends Loader {
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00";
	static #MAGIC = Uint8Array.from(FBXLoader.#MAGIC_STRING.split(""), character => character.charCodeAt(0));
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
	 * @param {Blob} header
	 */
	static async #parseHeader(header) {
		const arrayBuffer = await header.arrayBuffer();

		const magic = new Uint8Array(arrayBuffer.slice(0, 21));

		if (!this.#isMagicValid(magic)) {
			throw new Error("Invalid FBX file");
		}

		const version = FBXLoader.#bytesToInt(new Uint8Array(arrayBuffer.slice(23, 26)));

		console.log("FBX version:", version / 1000);
	}

	/**
	 * @param {Uint8Array} magic
	 */
	static #isMagicValid(magic) {
		for (let i = 0; i < FBXLoader.#MAGIC.length; i++) {
			if (magic[i] !== FBXLoader.#MAGIC[i]) {
				console.log(magic[i], FBXLoader.#MAGIC[i]);
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const blob = await response.blob();

		await FBXLoader.#parseHeader(blob);

		/* const textLines = text.split("\n");

		for (let i = 0; i < textLines.length; i++) {
			const textLine = textLines[i].trim();

			if (textLine.length === 0) {
				continue;
			}

			if (textLine.startsWith(FBXLoader.#COMMENT_CHARACTER)) {
				continue;
			}

			if (i === 0) {
				FBXLoader.#parseHeader(textLine);
			}
		} */
	}
}