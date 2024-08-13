import {Loader} from "./Loader.js";

export class FBXBinaryLoader extends Loader {
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00\x1a\x00";
	static #MAGIC = Uint8Array.from(FBXBinaryLoader.#MAGIC_STRING.split(""), character => character.charCodeAt(0));

	/**
	 * @type {Record.<Number, String>}
	 */
	static #PROPERTY_TYPE_CODES = {
		// Primitive types
		67: "C",
		68: "D",
		70: "F",
		73: "I",
		76: "L",
		89: "Y",
		// Array types
		98: "b",
		100: "d",
		102: "f",
		105: "i",
		108: "l",
		// Special types
		82: "R",
		83: "S",
	};

	/**
	 * @type {Record.<Number, ?Function>}
	 */
	static #PROPERTY_TYPE_HANDLERS = {
		// Primitive types
		67: null,
		68: null,
		70: null,
		73: null,
		76: null,
		89: null,
		// Array types
		98: null,
		100: null,
		102: null,
		105: null,
		108: null,
		// Special types
		82: FBXBinaryLoader.#handleBinaryProperty,
		83: FBXBinaryLoader.#handleStringProperty,
	};

	/**
	 * Max iteration count
	 */
	static #MAX_ROOT_NODE_RECORDS = 64;

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 */
	static #toString(arrayBuffer) {
		return String.fromCharCode(...new Uint8Array(arrayBuffer));
	}

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 * @param {DataView} dataView
	 */
	static #parseHeader(arrayBuffer, dataView) {
		const magic = new Uint8Array(arrayBuffer);

		if (!this.#isMagicValid(magic)) {
			throw new Error("Invalid binary FBX file");
		}

		const version = dataView.getUint32(23, true);

		console.log("FBX version:", version / 1000);
	}

	/**
	 * @param {Uint8Array} magic
	 */
	static #isMagicValid(magic) {
		for (let i = 0; i < FBXBinaryLoader.#MAGIC.length; i++) {
			if (magic[i] !== FBXBinaryLoader.#MAGIC[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static #parseNodeRecord(dataView, offset) {
		const EndOffset = dataView.getUint32(0, true);

		if (EndOffset === 0) {
			return EndOffset;
		}

		console.info("Parsing node record...");

		const NumProperties = dataView.getUint32(1 * Uint32Array.BYTES_PER_ELEMENT, true);
		const PropertyListLen = dataView.getUint32(2 * Uint32Array.BYTES_PER_ELEMENT, true);
		const NameLen = dataView.getUint8(3 * Uint32Array.BYTES_PER_ELEMENT);

		const Name = FBXBinaryLoader.#toString(dataView.buffer.slice(offset + 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT, offset + 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen));

		console.table({
			EndOffset,
			NumProperties,
			PropertyListLen,
			NameLen,
			Name,
		});

		let propertyOffset = 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen;

		for (let i = 0; i < NumProperties; i++) {
			propertyOffset = FBXBinaryLoader.#parsePropertyRecord(dataView, propertyOffset, offset);
		}

		return EndOffset;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 * @param {Number} nodeOffset
	 */
	static #parsePropertyRecord(dataView, offset, nodeOffset) {
		console.info("Parsing property record...");

		const TypeCode = dataView.getUint8(offset);

		console.table({
			TypeCode: FBXBinaryLoader.#PROPERTY_TYPE_CODES[TypeCode],
		});

		const handler = FBXBinaryLoader.#PROPERTY_TYPE_HANDLERS[TypeCode];

		if (!handler) {
			console.warn("Could not handle property with type code", TypeCode);

			return;
		}

		const length = handler(dataView, offset + 1 * Uint8Array.BYTES_PER_ELEMENT, nodeOffset);

		return offset + length;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 * @param {Number} nodeOffset
	 */
	static #handleBinaryProperty(dataView, offset, nodeOffset) {
		console.info("Handling binary property...");

		const Length = dataView.getUint32(offset, true);
		const Data = dataView.buffer.slice(nodeOffset + offset + Uint32Array.BYTES_PER_ELEMENT, nodeOffset + offset + Length);

		console.table({
			Length,
			Data,
		});

		return 1 * Uint32Array.BYTES_PER_ELEMENT + Length;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 * @param {Number} nodeOffset
	 */
	static #handleStringProperty(dataView, offset, nodeOffset) {
		console.info("Handling string property...");

		const Length = dataView.getUint32(offset, true);
		const Data = FBXBinaryLoader.#toString(dataView.buffer.slice(nodeOffset + offset + Uint32Array.BYTES_PER_ELEMENT, nodeOffset + offset + Length));

		console.table({
			Length,
			Data,
		});

		return 1 * Uint32Array.BYTES_PER_ELEMENT + Length;
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const arrayBuffer = await response.arrayBuffer();
		const headerDataView = new DataView(arrayBuffer);

		FBXBinaryLoader.#parseHeader(arrayBuffer, headerDataView);

		for (let i = 0, EndOffset = 27; i < FBXBinaryLoader.#MAX_ROOT_NODE_RECORDS; i++) {
			const dataView = new DataView(arrayBuffer, EndOffset);

			EndOffset = FBXBinaryLoader.#parseNodeRecord(dataView, EndOffset);

			if (EndOffset === 0) {
				console.info(`${i} root node records parsed.`);

				break;
			}
		}
	}
}